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
  },
  en: {
    title: "Plumbing Assistant — POC",
    heading: "Understand what is happening at your plumbing connection.",
    description: "This is an internal proof of concept for plumbing and heating assistance.",
    notice:
      "You are interacting with an AI assistant, not a person. The prototype can be wrong and does not replace a professional.",
    status: "Prototype is running",
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
      <p>
        <small>{text.title}</small>
      </p>
    </main>
  );
}
