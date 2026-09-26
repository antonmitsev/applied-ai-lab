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
  respond(request: ChatRequest): Promise<unknown>;
}

export function validateChatResponse(input: unknown, language: ChatLanguage): ChatResponse {
  if (!isRecord(input))
    throw new ApiError(502, "INVALID_PROVIDER_RESPONSE", "Provider response is not an object");
  if (typeof input.chatId !== "string" || input.chatId.length > 100) {
    throw new ApiError(
      502,
      "INVALID_PROVIDER_RESPONSE",
      "Provider response has an invalid chat ID",
    );
  }
  if (input.language !== language) {
    throw new ApiError(
      502,
      "INVALID_PROVIDER_RESPONSE",
      "Provider response language does not match the request",
    );
  }
  if (
    typeof input.message !== "string" ||
    input.message.length === 0 ||
    input.message.length > 8_000
  ) {
    throw new ApiError(
      502,
      "INVALID_PROVIDER_RESPONSE",
      "Provider response has an invalid message",
    );
  }
  const responseClasses = ["informational", "diagnostic", "clarify-first", "stop-and-escalate"];
  if (typeof input.responseClass !== "string" || !responseClasses.includes(input.responseClass)) {
    throw new ApiError(
      502,
      "INVALID_PROVIDER_RESPONSE",
      "Provider response has an invalid response class",
    );
  }
  if (!Array.isArray(input.citations) || input.citations.length > 8) {
    throw new ApiError(502, "INVALID_PROVIDER_RESPONSE", "Provider response has invalid citations");
  }
  const citations = input.citations.map((citation) => {
    if (
      !isRecord(citation) ||
      typeof citation.unitId !== "string" ||
      typeof citation.title !== "string"
    ) {
      throw new ApiError(
        502,
        "INVALID_PROVIDER_RESPONSE",
        "Provider response has an invalid citation",
      );
    }
    return {
      unitId: citation.unitId,
      title: citation.title,
      sourceId: typeof citation.sourceId === "string" ? citation.sourceId : null,
    };
  });
  return {
    chatId: input.chatId,
    language,
    message: input.message,
    citations,
    responseClass: input.responseClass as ChatResponse["responseClass"],
  };
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
