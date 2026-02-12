/**
 * Example enforcer that always passes.
 * @param {object} contract - Contract with exampleEnforcer config
 * @returns {{ passed: boolean, reason_code?: string, message?: string }}
 */
export function evaluate(contract) {
  const cfg = contract.exampleEnforcer;
  if (!cfg) return { passed: true };

  // This enforcer always passes, but could contain custom logic.
  return { passed: true, message: "Example enforcer always passes" };
}