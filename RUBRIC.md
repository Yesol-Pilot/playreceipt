# Build Week Rubric Strategy

The submission is optimized for the four equally weighted judging dimensions.

## Technical implementation

- Deterministic seeded simulation and rule evaluation.
- Stable, content-addressed JSON receipts.
- Explicit missing-evidence semantics and meaningful CLI exit codes.
- Tests cover failure, repair, human-review, missing evidence, and stability.
- One audit engine is exercised through browser POST, CLI, and a repository-root GitHub Action.
- Custom input is size-bounded, non-persistent, validated, and downloadable as an exact receipt.

## Design

- One-screen evidence hierarchy rather than a generic analytics dashboard.
- Verdict color is semantic: red repair, amber human review, green pass.
- Every gate exposes observed value, threshold, rationale, and source provenance.
- A judge-facing evidence drawer turns the dashboard from a staged showcase into an interactive tool in under 30 seconds.
- A four-stage trail makes the Codex audit → repair-plan → re-audit → human-boundary sequence legible without narration.

## Potential impact

AI-assisted development increases output speed but also makes shallow “build passed” claims cheaper. PlayReceipt creates a reusable quality boundary for teams shipping interactive products.

The same receipt can now block a pull request, guide a Codex repair, and remain inspectable by a human reviewer. That closes the gap between hackathon demo and team workflow.

## Quality of idea

The product makes a precise distinction most automated evaluators blur: reliability and balance can be measured, but fun still requires a person. That boundary is a feature, not a limitation.

## Submission proof map

| Claim | Proof |
|---|---|
| Real project can be reliable yet unshippable | `examples/overclock-20260717.json` and copied source evidence |
| Repair changes the verdict | deterministic broken/repaired receipts |
| Same input means same result | automated receipt-ID stability test |
| Human judgment is not fabricated | repaired case ends at `HUMAN_REVIEW` |
| New Build Week work is separable | git history and this repository boundary |
| Judges can audit their own evidence | credential-free POST flow and downloadable receipt |
| The verdict can govern CI | root `action.yml`, action runner test, and GitHub workflow |
| Codex use changes the workflow | repository skill plus visible repair trail and exact session evidence |
