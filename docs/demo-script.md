# Change Contract Enforcer – Hackathon Demo Script

**Time:** 3–5 minutes  
**Track:** Cline CLI as Infrastructure

---

## 1. Intro (30 sec)

> "Change Contract Enforcer turns Cline into a gated pipeline. Cline proposes changes; the enforcer decides if they're acceptable. The contract is code—versioned, reviewable, and enforceable."

---

## 2. Evaluate-Only Mode (1 min)

Show contract-as-code without running Cline:

```powershell
npx contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo .
```

**Expected:** `VERDICT: PASS ALL_CHECKS_PASSED` (if working tree complies)

**Say:** "We evaluate the current diff against the contract. No AI runs—just rules."

---

## 3. Full Pipeline: Cline + Enforcer (2 min)

Run Cline with a task, then evaluate the result:

```powershell
npx contractctl run --contract contracts/dependency-diff-tests.v1.yaml --repo . --prompt "Add a try/catch around the file read in utils/git.js"
```

**Expected:** Cline edits files; enforcer runs; `VERDICT: PASS` or `FAIL` with reason.

**Say:** "Cline is a headless worker. It never decides whether changes are acceptable—our contract does."

---

## 4. Show the Contract (30 sec)

```powershell
cat contracts/dependency-diff-tests.v1.yaml
```

**Highlight:**
- `diffBudget` – max lines/files
- `testsRequired` – tests must pass (toggle `runTests: true` when you have tests)
- `dependencyGate` – allow/block package changes

---

## 5. Show Verdict (30 sec)

```powershell
cat verdict.json
```

**Say:** "CI can read this. Exit code 0 = PASS, non-zero = FAIL. Gate merges on it."

---

## 6. Wrap-Up

> "Cline CLI as infrastructure: we orchestrate it, enforce contracts, and emit deterministic verdicts. Every change is governed by machine-readable rules."

---

## Troubleshooting

| Issue | Fix |
|------|-----|
| `CLINE_NOT_AVAILABLE` | `npm install -g cline` and `cline auth` |
| `CLINE_EXECUTION_FAILED` | Check model in Cline—use `gemini-2.5-flash` (not `gemini-1.5-flash-002`) |
| `TESTS_FAILED` | Set `testsRequired.runTests: false` in contract if no tests exist |
