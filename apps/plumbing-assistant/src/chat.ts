export type ChatLanguage = "bg" | "en";
export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  chatId?: string;
  language: ChatLanguage;
  message: string;
  history: ChatTurn[];
}

export interface ChatCitation {
  unitId: string;
  title: string;
  sourceId: string | null;
}

export interface ChatResponse {
  chatId: string;
  language: ChatLanguage;
  message: string;
  citations: ChatCitation[];
  responseClass: "informational" | "diagnostic" | "clarify-first" | "stop-and-escalate";
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requireString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) {
    throw new ApiError(
      400,
      "INVALID_REQUEST",
      `${field} must be a non-empty string of at most ${maxLength} characters`,
    );
  }
  return value.trim();
}

export function parseChatRequest(input: unknown): ChatRequest {
  if (!isRecord(input))
    throw new ApiError(400, "INVALID_REQUEST", "Request body must be a JSON object");
  const language = input.language;
  if (language !== "bg" && language !== "en") {
    throw new ApiError(400, "INVALID_REQUEST", "language must be bg or en");
  }
  const historyInput = input.history ?? [];
  if (!Array.isArray(historyInput) || historyInput.length > 12) {
    throw new ApiError(400, "INVALID_REQUEST", "history must contain at most 12 turns");
  }
  const history = historyInput.map((turn, index) => {
    if (!isRecord(turn) || (turn.role !== "user" && turn.role !== "assistant")) {
      throw new ApiError(400, "INVALID_REQUEST", `history[${index}].role is invalid`);
    }
    const role: ChatRole = turn.role;
    return {
      role,
      content: requireString(turn.content, `history[${index}].content`, 4_000),
    };
  });
  const chatId =
    input.chatId === undefined ? undefined : requireString(input.chatId, "chatId", 100);
  const message = requireString(input.message, "message", 4_000);
  return chatId === undefined
    ? { language, message, history }
    : { chatId, language, message, history };
}

export interface ChatRuntime {
  respond(request: ChatRequest): Promise<ChatResponse>;
}

export function createUnavailableChatRuntime(): ChatRuntime {
  return {
    async respond() {
      throw new ApiError(
        503,
        "PROVIDER_NOT_CONFIGURED",
        "No chat provider is configured for this POC runtime",
      );
    },
  };
}
