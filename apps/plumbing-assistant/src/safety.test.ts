import { describe, expect, it } from "vitest";
import { preTriage } from "./safety.js";

describe("deterministic safety pre-triage", () => {
  it("short-circuits water near electricity to critical stop-and-escalate", () => {
    const result = preTriage("There is water near electricity and sparks.", "en", "local-diy");

    expect(result).toMatchObject({
      urgency: "critical",
      responseClass: "stop-and-escalate",
      generatedStepsAllowed: false,
      professionalRequired: true,
    });
    expect(result.hazards).toContain("HZ-002");
    expect(result.actionCodes).toContain("DO_NOT_TOUCH_ELECTRICAL");
  });

  it("keeps unknown compatibility questions at caution", () => {
    const result = preTriage("Какъв о-пръстен да купя и сменя?", "bg", "local-diy");

    expect(result).toMatchObject({
      urgency: "caution",
      responseClass: "clarify-first",
      generatedStepsAllowed: false,
    });
    expect(result.hazards).toContain("HZ-009");
  });

  it("allows only routine local-diy responses to generate steps", () => {
    expect(preTriage("How does a threaded connection seal?", "en", "local-diy")).toMatchObject({
      urgency: "routine",
      generatedStepsAllowed: true,
      professionalRequired: false,
    });
  });
});
