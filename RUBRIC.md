# Build Week Rubric Strategy

The submission is optimized for the four equally weighted judging dimensions.

## Technical implementation

- Deterministic seeded simulation and rule evaluation.
- Stable, content-addressed JSON receipts.
- Explicit missing-evidence semantics and meaningful CLI exit codes.
- Tests cover failure, repair, human-review, missing evidence, and stability.

## Design

- One-screen evidence hierarchy rather than a generic analytics dashboard.
- Verdict color is semantic: red repair, amber human review, green pass.
- Every gate exposes observed value, threshold, rationale, and source provenance.

## Potential impact

AI-assisted development increases output speed but also makes shallow “build passed” claims cheaper. PlayReceipt creates a reusable quality boundary for teams shipping interactive products.

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
