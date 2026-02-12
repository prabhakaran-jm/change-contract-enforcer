# Architecture

## Overview

Change Contract Enforcer is a pipeline that:

1. **Optionally invokes Cline** – Headless (`-y` YOLO mode) to generate code changes from a prompt
2. **Collects change artifacts** – Git diff stats, dependency deltas
3. **Runs evaluators** – Each contract rule is checked
4. **Emits a verdict** – PASS or FAIL with reason code

```
[Contract YAML] + [Repo] + [Prompt?]
        ↓
   ┌─────────────┐
   │ Run Cline?  │──yes──→ spawn cline -y "prompt"
   └─────────────┘
        │
        ↓
   ┌─────────────┐
   │ Git utils   │ → diff stats, dependency changes
   └─────────────┘
        ↓
   ┌─────────────────────────────────────┐
   │ Evaluators                          │
   │  • diffBudget    (lines/files)      │
   │  • dependencyGate (add/remove deps)  │
   │  • testsRequired (run npm test)     │
   └─────────────────────────────────────┘
        ↓
   verdict.json or --output path (PASS | FAIL)
```

## Components

| Component | Role |
|-----------|------|
| `cli.js` | Entry point, argument passing |
| `runner.js` | Orchestration: contract load → Cline → evaluate → verdict |
| `cline.js` | Spawns Cline CLI in headless mode |
| `utils/contract.js` | Load and validate YAML contracts |
| `utils/git.js` | Git diff stats, dependency delta |
| `utils/parseArgs.js` | CLI argument parsing (--contract, --repo, --prompt, --output) |
| `evaluators/*.js` | Rule evaluators (diffBudget, testsRequired, dependencyGate) |

## Cline Integration

- **Invocation**: `cline -y "<prompt>"` with `cwd` set to the repo
- **Mode**: YOLO (`-y`) = auto-approve, plain text, exits when done
- **Requirement**: Cline must be installed globally (`npm install -g cline`) and authenticated

## Verdict Codes

| Code | Meaning |
|------|---------|
| `ALL_CHECKS_PASSED` | All evaluators passed |
| `DIFF_BUDGET_EXCEEDED` | Lines or files exceeded limits |
| `TESTS_FAILED` | Tests did not pass |
| `DEPENDENCY_*` | Dependency gate violation |
| `CLINE_NOT_AVAILABLE` | Cline CLI not found or not authenticated |
| `CLINE_EXECUTION_FAILED` | Cline exited with non-zero |
| `GIT_ERROR` | Not a git repo or git command failed |
