import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(repositoryRoot, "sources", "plumbing-assistant", "manifest.json");
const schemaPath = path.join(repositoryRoot, "docs", "sources", "source-manifest.schema.json");

const [manifestText, schemaText] = await Promise.all([
  readFile(manifestPath, "utf8"),
  readFile(schemaPath, "utf8"),
]);
const manifest = JSON.parse(manifestText);
const schema = JSON.parse(schemaText);
// The repository schema is Draft 2020-12, while the already-pinned repository
// validator dependency is Ajv 6. Normalize only the local $defs/$ref spelling
// needed for this validation command; the authoritative schema file is unchanged.
const compatibleSchema = JSON.parse(
  JSON.stringify(schema)
    .replaceAll('"$schema":"https://json-schema.org/draft/2020-12/schema",', "")
    .replaceAll('"$defs":', '"definitions":')
    .replaceAll("#/$defs/", "#/definitions/"),
);
const ajv = new Ajv({ allErrors: true, format: "full" });
const validate = ajv.compile(compatibleSchema);

if (!validate(manifest)) {
  console.error(JSON.stringify({ file: path.relative(repositoryRoot, manifestPath), errors: validate.errors }, null, 2));
  process.exit(1);
}

const sourceIds = manifest.sources.map((source) => source.source_id);
if (new Set(sourceIds).size !== sourceIds.length) {
  throw new Error("source manifest contains duplicate source_id values");
}

for (const source of manifest.sources) {
  if (source.status === "approved" && source.ingestion.approved_for_index !== true) {
    throw new Error(`${source.source_id}: approved sources must be approved_for_index`);
  }
  if (source.status !== "approved" && source.ingestion.approved_for_index === true) {
    throw new Error(`${source.source_id}: non-approved sources cannot be approved_for_index`);
  }
}

console.log(`Source manifest valid: ${manifest.sources.length} records; research_status=${manifest.research_status}`);
