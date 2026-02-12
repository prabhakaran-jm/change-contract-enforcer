/**
 * Evaluates dependency gate rules: allowAdd, allowRemove, blocklist, allowlist.
 * @param {object} contract - Contract with dependencyGate config
 * @param {{ added: string[], removed: string[] }} changes
 * @returns {{ passed: boolean, reason_code?: string, message?: string }}
 */
export function evaluate(contract, changes) {
  const gate = contract.dependencyGate;
  if (!gate) return { passed: true };

  if (!gate.allowRemove && changes.removed.length > 0) {
    return {
      passed: false,
      reason_code: "DEPENDENCY_REMOVAL_FORBIDDEN",
      message: `Removing dependencies is not allowed: ${changes.removed.join(", ")}`
    };
  }

  if (!gate.allowAdd && changes.added.length > 0) {
    return {
      passed: false,
      reason_code: "DEPENDENCY_ADDITION_FORBIDDEN",
      message: `Adding dependencies is not allowed: ${changes.added.join(", ")}`
    };
  }

  for (const pkg of changes.added) {
    if (gate.blocklist.includes(pkg)) {
      return {
        passed: false,
        reason_code: "DEPENDENCY_BLOCKLISTED",
        message: `Package is blocklisted: ${pkg}`
      };
    }
    if (gate.allowlist.length > 0 && !gate.allowlist.includes(pkg)) {
      return {
        passed: false,
        reason_code: "DEPENDENCY_NOT_ALLOWLISTED",
        message: `Package not in allowlist: ${pkg}`
      };
    }
  }

  return { passed: true };
}
