import { describe, it } from "node:test";
import assert from "node:assert";
import { evaluate } from "./dependencyGate.js";

describe("dependencyGate evaluator", () => {
  it("passes when no gate is configured", () => {
    const result = evaluate({ dependencyGate: null }, { added: ["lodash"], removed: [] });
    assert.strictEqual(result.passed, true);
  });

  it("fails when allowRemove is false and dependencies are removed", () => {
    const contract = {
      dependencyGate: { allowAdd: true, allowRemove: false, blocklist: [], allowlist: [] }
    };
    const changes = { added: [], removed: ["lodash"] };
    const result = evaluate(contract, changes);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.reason_code, "DEPENDENCY_REMOVAL_FORBIDDEN");
  });

  it("fails when added package is blocklisted", () => {
    const contract = {
      dependencyGate: { allowAdd: true, allowRemove: true, blocklist: ["lodash"], allowlist: [] }
    };
    const changes = { added: ["lodash"], removed: [] };
    const result = evaluate(contract, changes);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.reason_code, "DEPENDENCY_BLOCKLISTED");
  });

  it("passes when allowlist is empty (any add allowed)", () => {
    const contract = {
      dependencyGate: { allowAdd: true, allowRemove: true, blocklist: [], allowlist: [] }
    };
    const changes = { added: ["lodash"], removed: [] };
    const result = evaluate(contract, changes);
    assert.strictEqual(result.passed, true);
  });

  it("fails when allowlist is set and package not in it", () => {
    const contract = {
      dependencyGate: { allowAdd: true, allowRemove: true, blocklist: [], allowlist: ["chalk"] }
    };
    const changes = { added: ["lodash"], removed: [] };
    const result = evaluate(contract, changes);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.reason_code, "DEPENDENCY_NOT_ALLOWLISTED");
  });
});
