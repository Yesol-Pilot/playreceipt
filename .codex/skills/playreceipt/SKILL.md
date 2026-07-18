---
name: playreceipt
description: Audit AI-built game evidence, preserve honest human-review boundaries, and produce a stable release-quality receipt.
---

# PlayReceipt Codex workflow

Use this skill when a user asks whether an AI-built game is actually ready, requests an evidence-backed completion audit, or wants to compare a repair against the same gates.

1. Never infer missing metrics from source code or screenshots. Missing evidence is `UNVERIFIED`.
2. Preserve the audited project. Write normalized input and receipts outside the source project unless the user explicitly authorizes a project-local artifact.
3. Normalize evidence to the JSON shape documented in `examples/overclock-20260717.json`.
4. Run `node src/cli.js audit <input.json> --out <receipt.json>` from this repository, or use the root `action.yml` in CI. Browser/API/CLI/Action must share `src/audit.js`; never reimplement verdict logic in an adapter.
5. Interpret exit codes: `0` pass, `2` repair, `3` unverified, `4` human review.
6. Report the overall verdict first, then failing gates, exact evidence paths, and the receipt `repairPlan`. Only `REPAIR` and `UNVERIFIED` gates may create machine repair actions.
7. Never convert `HUMAN_REVIEW` into `PASS` without a recorded human play session.
8. After repair, rerun the same seeds and rules; compare receipt IDs and changed gates.
9. Treat `trail` as the audit handoff: `INGEST`, `JUDGE`, `REPAIR PLAN`, then `HUMAN BOUNDARY`. Do not claim persistence or repository crawling from the credential-free POST endpoint.

The CLI receipt is evidence, not a release approval.
