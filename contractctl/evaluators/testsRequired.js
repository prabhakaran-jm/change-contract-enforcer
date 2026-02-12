import { spawnSync } from "child_process";
import path from "path";

/**
 * Evaluates test requirements: run tests and optionally require pass.
 * @param {object} contract - Contract with testsRequired config
 * @param {string} repoPath - Path to the repository
 * @returns {{ passed: boolean, reason_code?: string, message?: string }}
 */
export function evaluate(contract, repoPath) {
  const cfg = contract.testsRequired;
  if (!cfg || !cfg.runTests) return { passed: true };

  const cwd = path.resolve(repoPath);
  const commandStr = (cfg.command || "npm test").trim();
  const [cmd, ...args] = commandStr.split(/\s+/).filter(Boolean);

  try {
    const result = spawnSync(cmd, args, {
      cwd,
      encoding: "utf8",
      timeout: 120000,
      shell: true
    });

    if (result.error) {
      return {
        passed: false,
        reason_code: "TESTS_FAILED",
        message: `Test command failed: ${result.error.message}`
      };
    }

    if (cfg.mustPass && result.status !== 0) {
      return {
        passed: false,
        reason_code: "TESTS_FAILED",
        message: `Tests exited with code ${result.status}`
      };
    }

    return { passed: true };
  } catch (err) {
    return {
      passed: false,
      reason_code: "TESTS_FAILED",
      message: err.message || "Failed to run tests"
    };
  }
}
