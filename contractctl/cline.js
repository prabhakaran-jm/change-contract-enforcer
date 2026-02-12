import { spawn } from "child_process";
import path from "path";

/**
 * Run Cline CLI in headless (YOLO) mode with the given prompt.
 * Requires: npm install -g cline (Cline must be installed globally).
 *
 * @param {object} options
 * @param {string} options.repoPath - Working directory for Cline (repository root)
 * @param {string} options.prompt - Task prompt to send to Cline
 * @param {number} [options.timeoutMs] - Max execution time in ms
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
export function runCline(options) {
  const { repoPath, prompt, timeoutMs = 300000 } = options;
  const cwd = path.resolve(repoPath);

  return new Promise((resolve, reject) => {
    // cline -y "prompt" -- YOLO mode, auto-approve, plain text output
    // On Windows, npm install -g creates cline.cmd; spawn needs shell to resolve it
    const args = ["-y", prompt];
    const proc = spawn("cline", args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      shell: true
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    let timeoutId = null;
    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        proc.kill("SIGTERM");
        reject(new Error(`Cline timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }

    proc.on("close", (code, signal) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        exitCode: code ?? -1,
        stdout,
        stderr
      });
    });

    proc.on("error", (err) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(new Error(`Failed to run Cline: ${err.message}. Is it installed? Run: npm install -g cline`));
    });
  });
}
