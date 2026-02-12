#!/usr/bin/env node

import { runContract } from "./runner.js";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: contractctl run --contract <file> [--repo <path>] [--prompt <task>] [--output <path>]");
  console.error("");
  console.error("Examples:");
  console.error("  contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo .");
  console.error("  contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo . --prompt \"Add a hello world function\"");
  process.exit(1);
}

runContract(args).catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
