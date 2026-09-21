import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SmartResearchAssistant } from "../index.js";
import { researchModes } from "../config.js";

describe("SmartResearchAssistant Component", () => {
  it("should instantiate SmartResearchAssistant", () => {
    const assistant = new SmartResearchAssistant({ silent: true });
    assert.ok(assistant);
    assert.equal(typeof assistant.run, "function");
  });

  it("should have all research modes available", () => {
    const modes = Object.keys(researchModes);
    assert.ok(modes.includes("COMPREHENSIVE"));
    assert.ok(modes.includes("QUICK"));
    assert.ok(modes.includes("TECHNICAL"));
    assert.ok(modes.includes("COMPARATIVE"));
    assert.ok(modes.includes("HISTORICAL"));
  });
});
