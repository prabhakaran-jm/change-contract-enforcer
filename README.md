<div align="center">

# Change Contract Enforcer

[![Contract Check](https://github.com/prabhakaran-jm/change-contract-enforcer/actions/workflows/contract-check.yml/badge.svg)](https://github.com/prabhakaran-jm/change-contract-enforcer/actions/workflows/contract-check.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

**Turn engineering intent into enforceable change contracts.**  
Uses [Cline](https://cline.bot) as a headless executor that blocks unsafe or non-compliant code changes.

</div>

---

## Overview

Modern AI coding tools generate changes quickly—but they fail when intent is ambiguous, constraints are implicit, or safety rules are violated. **Change Contract Enforcer** adds an explicit contract layer between intent and execution.

Every change is governed by a **machine-readable Change Contract** that defines:

| Rule | Purpose |
|------|---------|
| **diffBudget** | Max lines added/removed, max files changed |
| **testsRequired** | Run tests and require them to pass |
| **dependencyGate** | Allow or block adding/removing packages |

Cline runs strictly as a **headless worker**. It proposes and applies changes, but never decides whether they are acceptable. The enforcer evaluates the result, refuses violations, and emits a deterministic verdict.

> **What this is not:** A coding assistant, prompt wrapper, workflow generator, or chat interface. Change Contract Enforcer treats AI code generation as **infrastructure**, not interaction.

---

## Quick Start

```bash
# Install dependencies
npm install

# Install Cline CLI globally (required for --prompt mode)
npm install -g cline
cline auth   # Configure your AI provider (Anthropic, OpenAI, Gemini, etc.)

# Evaluate current working tree (no Cline)
npx contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo .

# Run Cline with a task, then evaluate
npx contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo . --prompt "Add error handling to utils.js"

# Custom verdict path (for CI)
npx contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo . --output ./artifacts/verdict.json
```

---

## Contract Format

Contracts are YAML files. Example structure:

```yaml
version: "1"
name: my-contract
diffBudget:
  maxLinesAdded: 500
  maxLinesRemoved: 200
  maxFilesChanged: 20
testsRequired:
  runTests: true
  mustPass: true
dependencyGate:
  allowAdd: true
  allowRemove: false
  blocklist: []
```

See [`contracts/dependency-diff-tests.v1.yaml`](contracts/dependency-diff-tests.v1.yaml) for a full example.

---

## Verdict

The enforcer writes `verdict.json` (or `--output` path) with:

| Field | Description |
|-------|-------------|
| `status` | `PASS` or `FAIL` |
| `reason_code` | e.g. `ALL_CHECKS_PASSED`, `DIFF_BUDGET_EXCEEDED`, `TESTS_FAILED` |
| `time_ms` | Execution time in milliseconds |

Use this in CI to gate merges—e.g. fail the pipeline when `status !== "PASS"`.

---

## CI Integration

A [GitHub Actions workflow](.github/workflows/contract-check.yml) runs the enforcer on push and pull requests:

- Evaluates changes against the contract
- Uploads `verdict.json` as an artifact
- Fails the job when verdict is `FAIL`

Configure the contract path and branch names in the workflow file as needed.

---

## Tests

```bash
npm test
```

Runs 11 tests covering contract loading, diff budget, and dependency gate evaluators.

---

## Programmatic API

```javascript
import { runContract, loadContract } from "change-contract-enforcer";

// Run full pipeline
await runContract(["run", "--contract", "contracts/example.yaml", "--repo", "."]);

// Load and inspect a contract
const contract = loadContract("contracts/dependency-diff-tests.v1.yaml");
console.log(contract.name, contract.diffBudget);
```

---

## Links

- [Architecture](docs/architecture.md) – Pipeline overview and verdict codes
- [Demo Script](docs/demo-script.md) – Step-by-step hackathon demo
- [Cline CLI](https://docs.cline.bot/cline-cli/overview) – Headless execution docs
