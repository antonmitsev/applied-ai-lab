import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildKnowledgeIndex, createDevelopmentIndexReceipt } from "./kb.js";

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(sourceDirectory, "../../..");
const index = await buildKnowledgeIndex(path.join(repositoryRoot, "docs", "kb"));

process.stdout.write(`${JSON.stringify(createDevelopmentIndexReceipt(index), null, 2)}\n`);
