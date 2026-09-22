import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([".git", "node_modules", ".next", "dist", "build", "coverage"]);
const failures = [];

/** Records a validation failure without stopping the remaining checks. */
function fail(message) {
  failures.push(message);
}

/** Returns a repository-relative, platform-independent path for diagnostics. */
function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

/** Recursively lists regular repository files while skipping generated trees. */
async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}

/** Resolves a document-local JSON Pointer and returns undefined when absent. */
function resolveJsonPointer(document, pointer) {
  if (pointer === "#") return document;
  if (!pointer.startsWith("#/")) return undefined;
  return pointer
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((value, part) => value?.[part], document);
}

/** Recursively collects document-local JSON references into the supplied array. */
function collectLocalRefs(value, refs = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectLocalRefs(item, refs);
  } else if (value && typeof value === "object") {
    if (typeof value.$ref === "string" && value.$ref.startsWith("#")) refs.push(value.$ref);
    for (const item of Object.values(value)) collectLocalRefs(item, refs);
  }
  return refs;
}

/** Validates JSON, JSONL, and local JSON references and returns item counts. */
async function validateJson(files) {
  let jsonCount = 0;
  let jsonlCount = 0;
  for (const file of files) {
    if (file.endsWith(".json")) {
      try {
        const document = JSON.parse(await readFile(file, "utf8"));
        jsonCount += 1;
        for (const ref of collectLocalRefs(document)) {
          if (resolveJsonPointer(document, ref) === undefined) {
            fail(`${relative(file)} has unresolved local JSON reference ${ref}`);
          }
        }
      } catch (error) {
        fail(`${relative(file)} is invalid JSON: ${error.message}`);
      }
    }

    if (file.endsWith(".jsonl")) {
      const lines = (await readFile(file, "utf8")).split(/\r?\n/);
      lines.forEach((line, index) => {
        if (!line.trim()) return;
        try {
          JSON.parse(line);
          jsonlCount += 1;
        } catch (error) {
          fail(`${relative(file)}:${index + 1} is invalid JSONL: ${error.message}`);
        }
      });
    }
  }
  return { jsonCount, jsonlCount };
}

/** Verifies that every relative Markdown inline link has an existing target. */
async function validateMarkdownLinks(files) {
  let markdownCount = 0;
  for (const file of files.filter((candidate) => candidate.endsWith(".md"))) {
    markdownCount += 1;
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      let target = match[1].trim().replace(/^<|>$/g, "");
      if (!target || /^(?:https?:|mailto:|#)/i.test(target)) continue;
      target = target.split("#", 1)[0];
      try {
        target = decodeURIComponent(target);
      } catch {
        fail(`${relative(file)} contains an invalid encoded link: ${match[1]}`);
        continue;
      }
      const resolved = path.resolve(path.dirname(file), target);
      try {
        await stat(resolved);
      } catch {
        fail(`${relative(file)} contains a missing local link: ${match[1]}`);
      }
    }
  }
  return markdownCount;
}

/** Expands one FR/AC ID or an inclusive same-prefix range into individual IDs. */
function expandTraceRange(label) {
  const match = /^(FR|AC)-(\d{2,3})(?:–(FR|AC)-(\d{2,3}))?$/.exec(label);
  if (!match) return [];
  const [, prefix, startText, endPrefix, endText] = match;
  if (endPrefix && endPrefix !== prefix) return [];
  const start = Number(startText);
  const end = endText ? Number(endText) : start;
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, offset) => `${prefix}-${String(start + offset).padStart(2, "0")}`);
}

/** Compares requirements with the matrix and enforces exact, complete coverage. */
async function validateTraceability() {
  const baseline = await readFile(path.join(root, "docs/requirements/plumbing-assistant-v0.1.md"), "utf8");
  const delta = await readFile(path.join(root, "docs/requirements/plumbing-assistant-v0.2-draft.md"), "utf8");
  const matrix = await readFile(path.join(root, "docs/traceability/plumbing-assistant.md"), "utf8");

  const expected = new Set();
  for (const document of [baseline, delta]) {
    for (const match of document.matchAll(/^### (FR-\d{2})\b/gm)) {
      if (expected.has(match[1])) fail(`Active requirement ID ${match[1]} is declared more than once`);
      expected.add(match[1]);
    }
  }
  for (let number = 1; number <= 10; number += 1) expected.add(`AC-${String(number).padStart(2, "0")}`);
  for (const match of delta.matchAll(/^### (AC-\d{2,3})\b/gm)) {
    if (expected.has(match[1])) fail(`Active acceptance ID ${match[1]} is declared more than once`);
    expected.add(match[1]);
  }

  const startMarker = "<!-- traceability-start -->";
  const endMarker = "<!-- traceability-end -->";
  const start = matrix.indexOf(startMarker);
  const end = matrix.indexOf(endMarker);
  if (start < 0 || end <= start) {
    fail("Traceability matrix markers are missing or out of order");
    return { expected: expected.size, mapped: 0 };
  }

  const mapped = new Set();
  const body = matrix.slice(start + startMarker.length, end);
  const rowPattern = /^\|\s*`((?:FR|AC)-\d{2,3}(?:–(?:FR|AC)-\d{2,3})?)`\s*\|(.+)$/gm;
  for (const match of body.matchAll(rowPattern)) {
    const ids = expandTraceRange(match[1]);
    if (ids.length === 0) {
      fail(`Invalid traceability range ${match[1]}`);
      continue;
    }
    const columns = match[2].split("|").map((column) => column.trim());
    if (columns.length !== 6 || columns.slice(0, 5).some((column) => !column)) {
      fail(`Traceability row ${match[1]} must populate all six columns`);
    }
    for (const id of ids) {
      if (mapped.has(id)) fail(`Traceability ID ${id} is mapped more than once`);
      mapped.add(id);
    }
  }

  for (const id of expected) if (!mapped.has(id)) fail(`Traceability ID ${id} is missing`);
  for (const id of mapped) if (!expected.has(id)) fail(`Traceability ID ${id} has no active requirement`);

  return { expected: expected.size, mapped: mapped.size };
}

/** Validates the bilingual service-page manifest, source copy, and footer contract. */
async function validatePublicDisclosures() {
  const directory = path.join(root, "docs/service");
  const manifestFile = path.join(directory, "public-pages.json");
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  const requiredIds = ["terms", "privacy", "cookies", "safety", "sources"];
  const documents = manifest.documents ?? [];
  const ids = documents.map((document) => document.id);
  const routes = new Set();
  const sources = new Set();

  if (manifest.specification_id !== "PA-SERVICE-001") fail("Public disclosure specification ID is invalid");
  if (manifest.status !== "pre-publication") fail("Public disclosure manifest must remain pre-publication until release review");
  if (!/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i.test(manifest.content_version ?? "")) fail("Public disclosure content version is invalid");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.last_updated ?? "")) fail("Public disclosure update date is invalid");
  if (JSON.stringify(ids) !== JSON.stringify(requiredIds)) fail("Public disclosure document set or order is incomplete");
  if (new Set(ids).size !== ids.length) fail("Public disclosure document IDs must be unique");

  const [year, month, day] = (manifest.last_updated ?? "").split("-");
  const englishMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const expectedDate = {
    bg: `${day}.${month}.${year} г.`,
    en: `${Number(day)} ${englishMonths[Number(month) - 1]} ${year}`,
  };

  for (const document of documents) {
    for (const locale of ["bg", "en"]) {
      const entry = document[locale];
      if (!entry || typeof entry.route !== "string" || typeof entry.source !== "string" || typeof entry.title !== "string") {
        fail(`Public disclosure ${document.id}:${locale} is incomplete`);
        continue;
      }
      if (routes.has(entry.route)) fail(`Duplicate public disclosure route ${entry.route}`);
      routes.add(entry.route);
      if (locale === "bg" && entry.route.startsWith("/en/")) fail(`Bulgarian route uses English prefix: ${entry.route}`);
      if (locale === "en" && !entry.route.startsWith("/en/")) fail(`English route lacks /en prefix: ${entry.route}`);

      const source = path.resolve(directory, entry.source);
      if (!source.startsWith(`${directory}${path.sep}`)) {
        fail(`Public disclosure source escapes its directory: ${entry.source}`);
        continue;
      }
      if (sources.has(source)) fail(`Public disclosure source is reused: ${entry.source}`);
      sources.add(source);
      try {
        const content = await readFile(source, "utf8");
        if (!content.startsWith(`# ${entry.title}\n`)) fail(`${relative(source)} title does not match its manifest entry`);
        if (!content.includes(`\`${manifest.content_version}\``)) fail(`${relative(source)} does not display the manifest content version`);
        if (!content.includes(expectedDate[locale])) fail(`${relative(source)} does not display the manifest update date`);
        if (!content.includes("mailto:me@tonymitsev.com")) fail(`${relative(source)} lacks the correction/contact path`);
      } catch (error) {
        fail(`Public disclosure source ${entry.source} cannot be read: ${error.message}`);
      }
    }
  }

  if (JSON.stringify(manifest.footer?.required_document_ids) !== JSON.stringify(requiredIds)) fail("Footer disclosure links are incomplete");
  if (manifest.footer?.copyright?.text !== "© 2026 Anton Mitsev" || manifest.footer?.copyright?.href !== "https://tonymitsev.com") fail("Footer copyright text or link is invalid");
  if (manifest.footer?.contact?.href !== "mailto:me@tonymitsev.com") fail("Footer contact link is invalid");
  if (manifest.footer?.source_code?.href !== "https://github.com/antonmitsev/applied-ai-lab") fail("Footer source-code link is invalid");
  if (manifest.footer?.license?.label !== "0BSD" || !manifest.footer?.license?.href?.endsWith("/blob/main/LICENSE")) fail("Footer 0BSD link is invalid");
  if (manifest.storage_profile?.mode !== "necessary-only" || manifest.storage_profile?.nonessential_enabled !== false || manifest.storage_profile?.consent_required_before_nonessential !== true) fail("Public storage/consent profile is invalid");
  for (const locale of ["bg", "en"]) {
    if ((manifest.pre_chat_notice?.[locale]?.length ?? 0) < 100) fail(`Pre-chat AI/safety notice is incomplete for ${locale}`);
  }

  return documents.length * 2;
}

/** Verifies unique primary-category allocation for every active FR and AC. */
async function validateScopeInventory() {
  const file = path.join(root, "docs/planning/plumbing-assistant-scope-inventory.json");
  const inventory = JSON.parse(await readFile(file, "utf8"));
  const baseline = await readFile(path.join(root, "docs/requirements/plumbing-assistant-v0.1.md"), "utf8");
  const delta = await readFile(path.join(root, "docs/requirements/plumbing-assistant-v0.2-draft.md"), "utf8");
  const expected = { FR: new Set(), AC: new Set() };
  const allocated = { FR: new Set(), AC: new Set() };

  for (const document of [baseline, delta]) {
    for (const match of document.matchAll(/^### (FR-\d{2})\b/gm)) expected.FR.add(match[1]);
  }
  for (let number = 1; number <= 10; number += 1) expected.AC.add(`AC-${String(number).padStart(2, "0")}`);
  for (const match of delta.matchAll(/^### (AC-\d{2,3})\b/gm)) expected.AC.add(match[1]);

  if (inventory.inventory_id !== "PA-SCOPE-001") fail("Scope inventory ID is invalid");
  const categoryIds = new Set();
  for (const category of inventory.categories ?? []) {
    if (!category.id || categoryIds.has(category.id)) fail(`Scope inventory category ID is missing or duplicated: ${category.id ?? "unknown"}`);
    categoryIds.add(category.id);
    for (const prefix of ["FR", "AC"]) {
      const field = prefix.toLowerCase();
      for (const range of category[field] ?? []) {
        const ids = expandTraceRange(range);
        if (ids.length === 0 || ids.some((id) => !id.startsWith(`${prefix}-`))) {
          fail(`Scope inventory range is invalid for ${category.id}:${field}: ${range}`);
          continue;
        }
        for (const id of ids) {
          if (allocated[prefix].has(id)) fail(`Scope inventory allocates ${id} more than once`);
          allocated[prefix].add(id);
        }
      }
    }
  }

  for (const prefix of ["FR", "AC"]) {
    if (inventory.requirement_totals?.[prefix] !== expected[prefix].size) fail(`Scope inventory ${prefix} total is stale`);
    for (const id of expected[prefix]) if (!allocated[prefix].has(id)) fail(`Scope inventory does not allocate ${id}`);
    for (const id of allocated[prefix]) if (!expected[prefix].has(id)) fail(`Scope inventory allocates inactive ${id}`);
  }

  return { categories: categoryIds.size, fr: allocated.FR.size, ac: allocated.AC.size };
}

/** Reproduces and verifies every published PA-ADMIN-SIG-1 positive vector. */
async function validateAdminSigningVector() {
  const file = path.join(root, "docs/contracts/admin-signing-test-vectors.json");
  const document = JSON.parse(await readFile(file, "utf8"));
  if (document.protocol !== "PA-ADMIN-SIG-1" || document.test_only !== true) {
    fail("Administrative signing vector metadata is invalid");
    return 0;
  }

  for (const vector of document.positive_vectors ?? []) {
    try {
      const request = vector.request;
      const canonical = [
        document.protocol,
        request.audience,
        request.key_id,
        request.timestamp,
        request.nonce_base64url,
        request.method,
        request.raw_path,
        request.canonical_query,
        request.content_type,
        request.body_sha256_hex,
      ].join("\n");
      const canonicalBytes = Buffer.from(canonical, "utf8");
      if (canonical !== vector.canonical_request_utf8) throw new Error("canonical text mismatch");
      if (canonicalBytes.toString("hex") !== vector.canonical_request_hex) throw new Error("canonical byte mismatch");
      if (createHash("sha256").update(canonicalBytes).digest("hex") !== vector.canonical_request_sha256_hex) throw new Error("canonical digest mismatch");
      if (createHash("sha256").update(Buffer.from(request.body_hex, "hex")).digest("hex") !== request.body_sha256_hex) throw new Error("body digest mismatch");

      const nonce = Buffer.from(request.nonce_base64url, "base64url");
      if (nonce.length !== 32 || nonce.toString("base64url") !== request.nonce_base64url) throw new Error("nonce encoding mismatch");

      const privateKey = createPrivateKey({
        key: Buffer.from(vector.private_key_pkcs8_der_base64, "base64"),
        format: "der",
        type: "pkcs8",
      });
      const publicKey = createPublicKey({
        key: Buffer.from(vector.public_key_spki_der_base64, "base64"),
        format: "der",
        type: "spki",
      });
      const derivedPublic = createPublicKey(privateKey).export({ format: "der", type: "spki" }).subarray(-32).toString("hex");
      if (derivedPublic !== vector.public_key_raw_hex) throw new Error("public key derivation mismatch");

      const signature = Buffer.from(vector.signature_base64url, "base64url");
      if (signature.length !== 64 || signature.toString("base64url") !== vector.signature_base64url || signature.toString("hex") !== vector.signature_hex) throw new Error("signature encoding mismatch");
      if (!verify(null, canonicalBytes, publicKey, signature)) throw new Error("signature verification failed");
      if (sign(null, canonicalBytes, privateKey).toString("hex") !== vector.signature_hex) throw new Error("signature reproduction failed");
      if (new Date(Number(request.timestamp) * 1000).toISOString() !== request.timestamp_utc) throw new Error("timestamp mismatch");
    } catch (error) {
      fail(`Administrative signing vector ${vector.id ?? "unknown"}: ${error.message}`);
    }
  }
  return document.positive_vectors?.length ?? 0;
}

/** Ensures every maintenance script and top-level function is documented. */
async function validateScriptDocumentation(files) {
  const readme = await readFile(path.join(root, "scripts/README.md"), "utf8");
  const scripts = files.filter((file) => {
    const name = relative(file);
    return name.startsWith("scripts/") && /\.(?:cjs|js|mjs)$/.test(name);
  });

  for (const file of scripts) {
    const name = path.basename(file);
    const content = await readFile(file, "utf8");
    if (!readme.includes(`## \`${name}\``)) fail(`scripts/README.md does not document ${name}`);

    const declarations = [
      ...content.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm),
      ...content.matchAll(/^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/gm),
    ];
    for (const declaration of declarations) {
      const functionName = declaration[1];
      const prefix = content.slice(0, declaration.index);
      if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(prefix)) {
        fail(`${relative(file)} function ${functionName} lacks an adjacent JSDoc comment`);
      }
      if (!readme.includes(`\`${functionName}(`)) {
        fail(`scripts/README.md does not explain ${name}:${functionName}`);
      }
    }
  }
  return scripts.length;
}

/** Detects forbidden runtime paths and selected high-confidence secret patterns. */
async function validateRepositoryHygiene(files) {
  const forbiddenPathPatterns = [
    /(?:^|\/)\.env$/,
    /\.(?:key|pem|p12|sqlite|sqlite3|db|log)$/i,
    /(?:^|\/)runtime-(?:data|secrets)\//,
    /(?:^|\/)uploads\//,
  ];
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
  ];

  for (const file of files) {
    const name = relative(file);
    if (forbiddenPathPatterns.some((pattern) => pattern.test(name))) {
      fail(`Forbidden runtime or secret file is tracked: ${name}`);
    }

    const buffer = await readFile(file);
    if (buffer.includes(0)) continue;
    const content = buffer.toString("utf8");
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) fail(`High-confidence credential pattern found in ${name}`);
    }
  }
}

const files = await walk(root);
const json = await validateJson(files);
const markdownCount = await validateMarkdownLinks(files);
const traceability = await validateTraceability();
const disclosurePages = await validatePublicDisclosures();
const scopeInventory = await validateScopeInventory();
const signingVectors = await validateAdminSigningVector();
const documentedScripts = await validateScriptDocumentation(files);
await validateRepositoryHygiene(files);

if (failures.length > 0) {
  console.error("Repository validation failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`JSON: ${json.jsonCount} files; JSONL: ${json.jsonlCount} records`);
  console.log(`Markdown links: ${markdownCount} files`);
  console.log(`Traceability: ${traceability.mapped}/${traceability.expected} requirement IDs`);
  console.log(`Public disclosure source pages: ${disclosurePages}`);
  console.log(`Scope inventory: ${scopeInventory.fr} FR; ${scopeInventory.ac} AC; ${scopeInventory.categories} categories`);
  console.log(`Administrative signing vectors: ${signingVectors}`);
  console.log(`Documented maintenance scripts: ${documentedScripts}`);
  console.log("Repository hygiene: PASS");
}
