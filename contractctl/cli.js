#!/usr/bin/env node

import { runContract } from "./runner.js";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: contractctl run --contract <file> --repo <path>");
  process.exit(1);
}

runContract(args).catch(err => {
  console.error("FATAL:", err.message);
  process.exit(1);
});