# Change Contract Enforcer

Change Contract Enforcer turns engineering intent into enforceable change contracts, using Cline as a headless executor that blocks unsafe or non-compliant code changes.

Modern AI coding tools can generate changes quickly, but they fail when intent is ambiguous, constraints are implicit, or safety rules are violated. This project introduces an explicit contract layer between intent and execution.

Every change is governed by a machine-readable Change Contract that defines:
- what is allowed
- what is forbidden
- how much change is acceptable
- whether tests must pass

Cline is used strictly as a headless worker.  
It proposes and applies changes, but never decides whether they are acceptable.

The enforcer evaluates the result, refuses violations, and emits a deterministic verdict.

## What this is not

- Not a coding assistant
- Not a prompt wrapper
- Not a workflow generator
- Not a chat interface

Change Contract Enforcer treats AI code generation as infrastructure, not interaction.

## Quick Start

```bash
# Install dependencies
npm install

# Install Cline CLI globally (required for --prompt mode)
npm install -g cline
cline auth   # Configure your AI provider

# Evaluate current working tree against a contract (no Cline)
npx contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo .

# Run Cline with a task, then evaluate the result
npx contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo . --prompt "Add error handling to utils.js"

# Optional: write verdict to a custom path (for CI)
npx contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo . --output ./artifacts/verdict.json
```

## Contract Format

Contracts are YAML files that define:

- **diffBudget** – Max lines added/removed, max files changed
- **testsRequired** – Run tests and require them to pass
- **dependencyGate** – Allow/block adding or removing packages

See `contracts/dependency-diff-tests.v1.yaml` for an example.

## Verdict

The enforcer writes `verdict.json` (or `--output` path) with `status` (PASS/FAIL), `reason_code`, and `time_ms`. Use this in CI to gate merges.

## CI Integration

A GitHub Actions workflow (`.github/workflows/contract-check.yml`) runs the enforcer on push/PR. Configure your contract and branch names as needed.

## Tests

```bash
npm test
```

## Programmatic API

```javascript
import { runContract, loadContract } from "change-contract-enforcer";

await runContract(["run", "--contract", "contracts/example.yaml", "--repo", "."]);
const contract = loadContract("contracts/dependency-diff-tests.v1.yaml");
```

