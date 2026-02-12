/**
 * Parse CLI arguments for contractctl run.
 * Usage: contractctl run --contract <file> --repo <path> [--prompt <string>] [--output <path>]
 */
export function parseArgs(args) {
  const result = {
    command: "run",
    contract: null,
    repo: ".",
    prompt: null,
    output: "verdict.json"
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--contract" || arg === "-c") {
      result.contract = args[++i];
    } else if (arg === "--repo" || arg === "-r") {
      result.repo = args[++i];
    } else if (arg === "--prompt" || arg === "-p") {
      result.prompt = args[++i];
    } else if (arg === "--output" || arg === "-o") {
      result.output = args[++i];
    } else if (arg === "run" && i === 0) {
      result.command = "run";
    }
  }

  return result;
}
