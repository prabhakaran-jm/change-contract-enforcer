/**
 * Evaluates diff budget rules: max lines added/removed, max files changed.
 * @param {object} contract - Contract with diffBudget config
 * @param {{ added: number, removed: number, filesChanged: string[] }} stats
 * @returns {{ passed: boolean, reason_code?: string, message?: string }}
 */
export function evaluate(contract, stats) {
  const budget = contract.diffBudget;
  if (!budget) return { passed: true };

  if (budget.maxLinesAdded != null && stats.added > budget.maxLinesAdded) {
    return {
      passed: false,
      reason_code: "DIFF_BUDGET_EXCEEDED",
      message: `Lines added (${stats.added}) exceeds max (${budget.maxLinesAdded})`
    };
  }
  if (budget.maxLinesRemoved != null && stats.removed > budget.maxLinesRemoved) {
    return {
      passed: false,
      reason_code: "DIFF_BUDGET_EXCEEDED",
      message: `Lines removed (${stats.removed}) exceeds max (${budget.maxLinesRemoved})`
    };
  }
  if (budget.maxFilesChanged != null && stats.filesChanged.length > budget.maxFilesChanged) {
    return {
      passed: false,
      reason_code: "DIFF_BUDGET_EXCEEDED",
      message: `Files changed (${stats.filesChanged.length}) exceeds max (${budget.maxFilesChanged})`
    };
  }

  return { passed: true };
}
