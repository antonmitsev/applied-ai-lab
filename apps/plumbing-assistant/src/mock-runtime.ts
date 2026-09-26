import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ChatRequest, ChatResponse, ChatRuntime } from "./chat.js";
import { buildKnowledgeIndex, searchKnowledge, type KnowledgeIndex } from "./kb.js";

function defaultKbRoot(): string {
  const currentFile = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), "docs/kb"),
    path.resolve(currentFile, "../../../docs/kb"),
    path.resolve(currentFile, "../../../../docs/kb"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0] ?? process.cwd();
}

export function createMockChatRuntime(kbRoot = defaultKbRoot()): ChatRuntime {
  let indexPromise: Promise<KnowledgeIndex> | undefined;
  const getIndex = () => (indexPromise ??= buildKnowledgeIndex(kbRoot));
  return {
    async respond(request: ChatRequest): Promise<ChatResponse> {
      const results = searchKnowledge(await getIndex(), request.message, 3);
      const citations = results.map((result) => ({
        unitId: result.unitId,
        title: result.title,
        sourceId: result.sourceId,
      }));
      const responseClass = results.length > 0 ? "informational" : "clarify-first";
      const message =
        request.language === "bg"
          ? results.length > 0
            ? `Това е локален mock отговор върху draft KB. Най-релевантно: ${results.map((result) => result.title).join("; ")}. Не приемайте това за потвърдена съвместимост.`
            : "Не намирам достатъчно локално знание за този въпрос. Нужно е уточнение за системата, компонента и безопасното състояние."
          : results.length > 0
            ? `This is a local mock response over the draft KB. Most relevant: ${results.map((result) => result.title).join("; ")}. Do not treat this as confirmed compatibility.`
            : "I do not have enough local evidence for this question. Clarify the system, component, and safe state before proceeding.";
      return {
        chatId: request.chatId ?? randomUUID(),
        language: request.language,
        message,
        citations,
        responseClass,
      };
    },
  };
}
