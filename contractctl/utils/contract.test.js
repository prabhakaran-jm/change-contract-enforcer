import { describe, it } from "node:test";
import assert from "node:assert";
import { loadContract } from "./contract.js";

describe("loadContract", () => {
  it("loads and normalizes a valid contract", () => {
    const contract = loadContract("contracts/dependency-diff-tests.v1.yaml");
    assert.strictEqual(contract.name, "dependency-diff-tests");
    assert.strictEqual(contract.version, "1");
    assert.ok(contract.diffBudget);
    assert.strictEqual(contract.diffBudget.maxLinesAdded, 500);
    assert.ok(contract.testsRequired);
    assert.ok(contract.dependencyGate);
  });

  it("throws when file not found", () => {
    assert.throws(
      () => loadContract("contracts/nonexistent.yaml"),
      /Contract file not found/
    );
  });
});
