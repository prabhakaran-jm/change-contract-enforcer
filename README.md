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

