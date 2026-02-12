import fs from "fs";
import path from "path";
import yaml from "js-yaml";

/**
 * Load and parse a change contract from a YAML file.
 * @param {string} contractPath - Path to the contract YAML file
 * @returns {object} Parsed contract with validated structure
 */
export function loadContract(contractPath) {
  const absPath = path.resolve(contractPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Contract file not found: ${absPath}`);
  }
  const raw = fs.readFileSync(absPath, "utf8");
  const parsed = yaml.load(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid contract: expected YAML object`);
  }
  return validateContract(parsed);
}

/**
 * Validate contract structure; returns normalized contract.
 */
function validateContract(c) {
  const contract = {
    version: c.version ?? "1",
    name: c.name ?? "unnamed",
    description: c.description ?? "",
    diffBudget: normalizeDiffBudget(c.diffBudget),
    testsRequired: normalizeTestsRequired(c.testsRequired),
    dependencyGate: normalizeDependencyGate(c.dependencyGate)
  };
  return contract;
}

function normalizeDiffBudget(b) {
  if (!b || typeof b !== "object") return null;
  return {
    maxLinesAdded: typeof b.maxLinesAdded === "number" ? b.maxLinesAdded : null,
    maxLinesRemoved: typeof b.maxLinesRemoved === "number" ? b.maxLinesRemoved : null,
    maxFilesChanged: typeof b.maxFilesChanged === "number" ? b.maxFilesChanged : null
  };
}

function normalizeTestsRequired(t) {
  if (!t || typeof t !== "object") return null;
  return {
    runTests: !!t.runTests,
    mustPass: !!t.mustPass,
    command: typeof t.command === "string" ? t.command : "npm test"
  };
}

function normalizeDependencyGate(d) {
  if (!d || typeof d !== "object") return null;
  return {
    allowAdd: d.allowAdd !== false,
    allowRemove: !!d.allowRemove,
    blocklist: Array.isArray(d.blocklist) ? d.blocklist : [],
    allowlist: Array.isArray(d.allowlist) ? d.allowlist : []
  };
}
