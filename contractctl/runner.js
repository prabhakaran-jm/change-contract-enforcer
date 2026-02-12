import fs from "fs";
import path from "path";
import { loadContract } from "./utils/contract.js";
import { parseArgs } from "./utils/parseArgs.js";
import { getDiffStats, getDependencyChanges } from "./utils/git.js";
import { runCline } from "./cline.js";
import { evaluate as evalDiffBudget } from "./evaluators/diffBudget.js";
import { evaluate as evalTestsRequired } from "./evaluators/testsRequired.js";
import { evaluate as evalDependencyGate } from "./evaluators/dependencyGate.js";

/**
 * Main entry: run contract against repo.
 * Flow: parse args → load contract → (optional) run Cline → evaluate → verdict
 */
export async function runContract(args) {
  const startMs = Date.now();
  const opts = parseArgs(args);

  const verdictPath = opts.output || "verdict.json";

  if (!opts.contract) {
    throw new Error("Missing --contract <file>. Usage: contractctl run --contract <file> --repo <path> [--prompt <task>]");
  }

  console.log("Change Contract Enforcer");
  console.log("Mode: headless");
  console.log("Status: initializing");

  const contract = loadContract(opts.contract);
  const repoPath = path.resolve(opts.repo);

  console.log(`Contract: ${contract.name} (v${contract.version})`);

  // Step 1: Optionally run Cline to generate changes
  if (opts.prompt) {
    console.log("Status: running Cline...");
    try {
      const clineResult = await runCline({
        repoPath,
        prompt: opts.prompt,
        timeoutMs: 300000
      });
      if (clineResult.exitCode !== 0) {
        const errPreview = truncateOutput(clineResult.stderr || clineResult.stdout || "", 500);
        const verdict = {
          status: "FAIL",
          reason_code: "CLINE_EXECUTION_FAILED",
          message: `Cline exited with code ${clineResult.exitCode}`,
          cline_stderr: clineResult.stderr || "",
          cline_stdout: clineResult.stdout || "",
          time_ms: Date.now() - startMs
        };
        writeVerdict(verdict, verdictPath);
        console.log("VERDICT:", verdict.status, verdict.reason_code);
        if (errPreview) {
          console.error("\nCline output (last 500 chars):");
          console.error(errPreview);
        }
        return;
      }
      console.log("Status: Cline complete, evaluating...");
    } catch (err) {
      const verdict = {
        status: "FAIL",
        reason_code: "CLINE_NOT_AVAILABLE",
        message: err.message,
        time_ms: Date.now() - startMs
      };
      writeVerdict(verdict, verdictPath);
      console.log("VERDICT:", verdict.status, verdict.reason_code);
      return;
    }
  } else {
    console.log("Status: no --prompt provided, evaluating current working tree only");
  }

  // Step 2: Collect change artifacts
  let diffStats, depChanges;
  try {
    diffStats = getDiffStats(repoPath);
    depChanges = getDependencyChanges(repoPath);
  } catch (err) {
    const verdict = {
      status: "FAIL",
      reason_code: "GIT_ERROR",
      message: err.message,
      time_ms: Date.now() - startMs
    };
    writeVerdict(verdict, verdictPath);
    console.log("VERDICT:", verdict.status, verdict.reason_code);
    return;
  }

  // Step 3: Run evaluators
  const db = evalDiffBudget(contract, diffStats);
  if (!db.passed) {
    finishFail(db.reason_code, db.message, startMs, verdictPath);
    return;
  }

  const dg = evalDependencyGate(contract, depChanges);
  if (!dg.passed) {
    finishFail(dg.reason_code, dg.message, startMs, verdictPath);
    return;
  }

  const tr = evalTestsRequired(contract, repoPath);
  if (!tr.passed) {
    finishFail(tr.reason_code, tr.message, startMs, verdictPath);
    return;
  }

  const verdict = {
    status: "PASS",
    reason_code: "ALL_CHECKS_PASSED",
    time_ms: Date.now() - startMs
  };
  writeVerdict(verdict, verdictPath);
  console.log("VERDICT:", verdict.status, verdict.reason_code);
}

function finishFail(reasonCode, message, startMs, verdictPath) {
  const verdict = {
    status: "FAIL",
    reason_code: reasonCode,
    message: message || "",
    time_ms: Date.now() - startMs
  };
  writeVerdict(verdict, verdictPath);
  console.log("VERDICT:", verdict.status, verdict.reason_code);
}

function writeVerdict(verdict, path = "verdict.json") {
  fs.writeFileSync(path, JSON.stringify(verdict, null, 2));
}

function truncateOutput(str, maxLen) {
  if (!str || str.length <= maxLen) return str;
  return "...\n" + str.slice(-maxLen);
}
