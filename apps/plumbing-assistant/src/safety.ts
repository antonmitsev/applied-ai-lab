import type { ChatLanguage } from "./chat.js";

export type Urgency = "routine" | "caution" | "critical";
export type SafetyResponseClass =
  "informational" | "diagnostic" | "local-diy" | "clarify-first" | "stop-and-escalate";

export interface SafetyDecision {
  urgency: Urgency;
  responseClass: SafetyResponseClass;
  generatedStepsAllowed: boolean;
  professionalRequired: boolean;
  hazards: string[];
  actionCodes: string[];
  language: ChatLanguage;
}

const severityRank: Record<Urgency, number> = { routine: 0, caution: 1, critical: 2 };
const classRank: Record<SafetyResponseClass, number> = {
  informational: 0,
  diagnostic: 1,
  "local-diy": 1,
  "clarify-first": 2,
  "stop-and-escalate": 3,
};

function raiseUrgency(left: Urgency, right: Urgency): Urgency {
  return severityRank[right] > severityRank[left] ? right : left;
}

function restrictClass(left: SafetyResponseClass, right: SafetyResponseClass): SafetyResponseClass {
  return classRank[right] > classRank[left] ? right : left;
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function preTriage(
  message: string,
  language: ChatLanguage,
  requestedResponseClass: SafetyResponseClass = "diagnostic",
): SafetyDecision {
  const text = message.toLocaleLowerCase();
  const hazards: string[] = [];
  let urgency: Urgency = "routine";
  let responseClass = requestedResponseClass;
  const addHazard = (code: string, minimumUrgency: Urgency, floorClass: SafetyResponseClass) => {
    hazards.push(code);
    urgency = raiseUrgency(urgency, minimumUrgency);
    responseClass = restrictClass(responseClass, floorClass);
  };

  if (
    includesAny(text, [
      "water near electricity",
      "electric shock",
      "sparks",
      "искри",
      "ток",
      "контакт",
      "електр",
    ])
  ) {
    addHazard("HZ-002", "critical", "stop-and-escalate");
  }
  if (
    includesAny(text, [
      "gas smell",
      "carbon monoxide",
      "co alarm",
      "газ",
      "въглероден оксид",
      "дим от бойлер",
    ])
  ) {
    addHazard("HZ-006", "critical", "stop-and-escalate");
  }
  if (includesAny(text, ["steam", "scalding", "boiling", "пара", "вряла", "много горещ"])) {
    addHazard("HZ-003", "critical", "stop-and-escalate");
  }
  if (
    includesAny(text, [
      "flooding",
      "burst pipe",
      "uncontrolled leak",
      "наводн",
      "спукана тръба",
      "шурти",
    ])
  ) {
    addHazard("HZ-001", "critical", "stop-and-escalate");
  }
  if (
    includesAny(text, [
      "pressure gauge",
      "relief valve",
      "манометър",
      "предпазен клапан",
      "налягането скача",
    ])
  ) {
    addHazard("HZ-004", "critical", "stop-and-escalate");
  }
  if (includesAny(text, ["sewage", "wastewater", "канализация", "отпадна вода"])) {
    addHazard("HZ-005", "caution", "stop-and-escalate");
  }
  if (includesAny(text, ["mix chemicals", "chemical", "химикал", "смесвам препарати"])) {
    addHazard("HZ-011", "caution", "clarify-first");
  }
  if (includesAny(text, ["shared riser", "building heating", "общ щранг", "обща инсталация"])) {
    addHazard("HZ-007", "caution", "stop-and-escalate");
  }
  if (
    includesAny(text, [
      "cut pipe",
      "drill",
      "solder",
      "weld",
      "режа тръбата",
      "пробивам",
      "заварявам",
    ])
  ) {
    addHazard("HZ-010", "caution", "stop-and-escalate");
  }
  if (
    includesAny(text, [
      "which part",
      "what seal",
      "what fitting",
      "кой детайл",
      "какъв о-пръстен",
      "каква гарнитура",
    ]) &&
    includesAny(text, ["buy", "replace", "change", "купя", "сменя", "подходящ"])
  ) {
    addHazard("HZ-009", "caution", "clarify-first");
  }

  const finalUrgency = urgency as Urgency;
  if (finalUrgency === "critical") responseClass = "stop-and-escalate";
  const generatedStepsAllowed = finalUrgency === "routine" && responseClass === "local-diy";
  const actionCodes =
    finalUrgency === "critical"
      ? ["KEEP_DISTANCE", "KEEP_OTHERS_AWAY", "CONTACT_EMERGENCY_PLUMBER"]
      : finalUrgency === "caution"
        ? ["OBSERVE_WITHOUT_TOUCHING", "CONTACT_BUILDING_MANAGER"]
        : [];
  if (hazards.includes("HZ-002")) actionCodes.push("DO_NOT_TOUCH_ELECTRICAL");
  if (hazards.includes("HZ-011")) actionCodes.push("DO_NOT_MIX_CHEMICALS");
  return {
    urgency: finalUrgency,
    responseClass,
    generatedStepsAllowed,
    professionalRequired: responseClass === "stop-and-escalate",
    hazards,
    actionCodes: [...new Set(actionCodes)],
    language,
  };
}
