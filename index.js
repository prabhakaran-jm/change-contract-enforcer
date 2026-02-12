/**
 * Change Contract Enforcer – Programmatic API
 * Re-exports from contractctl for require/import from package root.
 */
export {
  runContract,
  loadContract,
  runCline,
  getDiffStats,
  getDependencyChanges,
  evalDiffBudget,
  evalTestsRequired,
  evalDependencyGate
} from "./contractctl/index.js";
