export type Language = "bg" | "en";

type AppProps = {
  language: Language;
};

const copy = {
  bg: {
    title: "Plumbing Assistant — POC",
    heading: "Разберете какво се случва с Вашата водопроводна връзка.",
    description: "Това е вътрешен прототип на AI помощник за водопроводни и отоплителни проблеми.",
    notice:
      "Разговаряте с AI помощник, не с човек. Прототипът може да греши и не заменя специалист.",
    status: "Прототипът работи",
    inputLabel: "Опишете проблема",
    inputPlaceholder: "Например: Връзката тече повече, когато затегна гайката.",
    send: "Изпрати",
    newChat: "Нов чат",
    emptyResponse: "Отговорът ще се появи тук.",
    legal: ["Условия", "Поверителност", "Бисквитки", "Безопасност", "Източници"],
  },
  en: {
    title: "Plumbing Assistant — POC",
    heading: "Understand what is happening at your plumbing connection.",
    description: "This is an internal proof of concept for plumbing and heating assistance.",
    notice:
      "You are interacting with an AI assistant, not a person. The prototype can be wrong and does not replace a professional.",
    status: "Prototype is running",
    inputLabel: "Describe the problem",
    inputPlaceholder: "For example: The joint leaks more when I tighten the nut.",
    send: "Send",
    newChat: "New chat",
    emptyResponse: "The response will appear here.",
    legal: ["Terms", "Privacy", "Cookies", "Safety", "Sources"],
  },
} as const;

export function App({ language }: AppProps) {
  const text = copy[language];
  const alternateLanguage = language === "bg" ? "en" : "bg";
  const alternatePath = language === "bg" ? "/en" : "/";

  return (
    <main lang={language}>
      <p>
        <a href={alternatePath}>{alternateLanguage.toUpperCase()}</a>
      </p>
      <h1>{text.heading}</h1>
      <p>{text.description}</p>
      <p role="note">{text.notice}</p>
      <p>{text.status}</p>
      <form id="chat-form" data-language={language}>
        <label htmlFor="chat-message">{text.inputLabel}</label>
        <textarea
          id="chat-message"
          name="message"
          maxLength={4000}
          required
          placeholder={text.inputPlaceholder}
        />
        <input id="chat-id" name="chatId" type="hidden" />
        <p>
          <button type="submit">{text.send}</button>{" "}
          <button id="new-chat" type="button">
            {text.newChat}
          </button>
        </p>
      </form>
      <section aria-live="polite" id="chat-response">
        <p id="chat-status">{text.emptyResponse}</p>
        <ol id="chat-citations" />
      </section>
      <nav aria-label="Legal links">
        <a href={language === "bg" ? "/terms" : "/en/terms"}>{text.legal[0]}</a>
        {" · "}
        <a href={language === "bg" ? "/privacy" : "/en/privacy"}>{text.legal[1]}</a>
        {" · "}
        <a href={language === "bg" ? "/cookies" : "/en/cookies"}>{text.legal[2]}</a>
        {" · "}
        <a href={language === "bg" ? "/safety" : "/en/safety"}>{text.legal[3]}</a>
        {" · "}
        <a href={language === "bg" ? "/sources" : "/en/sources"}>{text.legal[4]}</a>
      </nav>
      <footer>
        <a href="mailto:me@tonymitsev.com">me@tonymitsev.com</a>
        {" · "}
        <a href="https://github.com/antonmitsev/applied-ai-lab">Source</a>
        {" · "}© 2026 Anton Mitsev
      </footer>
      <script
        dangerouslySetInnerHTML={{
          __html: `(() => {
  const form = document.getElementById("chat-form");
  const message = document.getElementById("chat-message");
  const chatId = document.getElementById("chat-id");
  const status = document.getElementById("chat-status");
  const citations = document.getElementById("chat-citations");
  const language = form?.dataset.language;
  if (!form || !message || !chatId || !status || !citations || !language) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "${language === "bg" ? "Изчакване…" : "Waiting…"}";
    citations.replaceChildren();
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ language, message: message.value, chatId: chatId.value || undefined }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || "Request failed");
      chatId.value = payload.chatId || "";
      status.textContent = payload.message;
      for (const citation of payload.citations || []) {
        const item = document.createElement("li");
        item.textContent = citation.title + " (" + citation.unitId + ")";
        citations.appendChild(item);
      }
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Request failed";
    }
  });
  document.getElementById("new-chat")?.addEventListener("click", async () => {
    const response = await fetch("/api/new-chat", { method: "POST" });
    const payload = await response.json();
    chatId.value = payload.chatId || "";
    message.value = "";
    status.textContent = "${language === "bg" ? "Нов чат." : "New chat."}";
    citations.replaceChildren();
  });
})();`,
        }}
      />
      <p>
        <small>{text.title}</small>
      </p>
    </main>
  );
}
