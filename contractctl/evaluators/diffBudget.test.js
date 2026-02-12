import { describe, it } from "node:test";
import assert from "node:assert";
import { evaluate } from "./diffBudget.js";

describe("diffBudget evaluator", () => {
  it("passes when no budget is configured", () => {
    const result = evaluate({ diffBudget: null }, { added: 1000, removed: 500, filesChanged: [] });
    assert.strictEqual(result.passed, true);
  });

  it("passes when within budget", () => {
    const contract = {
      diffBudget: { maxLinesAdded: 500, maxLinesRemoved: 200, maxFilesChanged: 10 }
    };
    const stats = { added: 100, removed: 50, filesChanged: ["a.js", "b.js"] };
    const result = evaluate(contract, stats);
    assert.strictEqual(result.passed, true);
  });

  it("fails when lines added exceed budget", () => {
    const contract = {
      diffBudget: { maxLinesAdded: 100, maxLinesRemoved: 200, maxFilesChanged: 10 }
    };
    const stats = { added: 150, removed: 50, filesChanged: [] };
    const result = evaluate(contract, stats);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.reason_code, "DIFF_BUDGET_EXCEEDED");
  });

  it("fails when files changed exceed budget", () => {
    const contract = {
      diffBudget: { maxLinesAdded: 500, maxLinesRemoved: 500, maxFilesChanged: 2 }
    };
    const stats = { added: 10, removed: 5, filesChanged: ["a.js", "b.js", "c.js"] };
    const result = evaluate(contract, stats);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.reason_code, "DIFF_BUDGET_EXCEEDED");
  });
});
