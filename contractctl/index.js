/**
 * Change Contract Enforcer – Programmatic API
 *
 * Use this module to run contracts from your own scripts, CI pipelines,
 * or Node.js applications.
 *
 * @example
 * import { runContract, loadContract } from 'change-contract-enforcer';
 *
 * // Run full pipeline (contract + optional Cline + evaluation)
 * await runContract(['run', '--contract', 'contracts/example.yaml', '--repo', '.']);
 *
 * // Load and inspect a contract
 * const contract = loadContract('contracts/dependency-diff-tests.v1.yaml');
 * console.log(contract.name, contract.diffBudget);
 */

export { runContract } from "./runner.js";
export { loadContract } from "./utils/contract.js";
export { runCline } from "./cline.js";
export { getDiffStats, getDependencyChanges } from "./utils/git.js";
export { evaluate as evalDiffBudget } from "./evaluators/diffBudget.js";
export { evaluate as evalTestsRequired } from "./evaluators/testsRequired.js";
export { evaluate as evalDependencyGate } from "./evaluators/dependencyGate.js";
