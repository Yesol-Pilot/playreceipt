# PlayReceipt BuildSpec

## Build Week scope

This repository is new work created during OpenAI Build Week. It uses one read-only evidence snapshot from an existing game project as an input case. The original game is neither repackaged nor presented as newly built work.

## Required product surface

- Zero-install local web dashboard using the Node.js standard library.
- CLI commands for a supplied evidence file and deterministic `broken` / `repaired` simulations.
- Eight explicit gates across reliability, balance, accessibility, and human review.
- Stable SHA-256 receipt IDs for identical evidence and rules.
- Three inspectable cases: real project evidence, broken sandbox, repaired sandbox.
- No hidden network dependency for the audit engine or dashboard data.

## Gate contract

| Gate | Pass threshold | Honest fallback |
|---|---:|---|
| Deterministic runs | 500 or more | `UNVERIFIED` when absent |
| Crashes | 0 | `REPAIR` above 0 |
| Stalls | 0 | `REPAIR` above 0 |
| Policy spread | 15 percentage points or more | `REPAIR` below threshold |
| Strategic edge over random | 5 percentage points or more | `REPAIR` below threshold |
| Minimum font size | 12 px or more | `REPAIR` below threshold |
| Photosensitivity prompt + reduced motion | both true | `REPAIR` when incomplete |
| Human fun calibration | reviewed by a human | `HUMAN_REVIEW` when open |

## Technical constraints

- Node.js 20 or newer.
- No runtime npm dependencies.
- Deterministic seeded simulation.
- JSON is both the input and receipt interchange format.
- Source evidence remains unmodified and is copied with provenance.

## Demo acceptance

1. `npm test` passes.
2. `npm run simulate:broken` exits with code 2 and emits `REPAIR`.
3. `npm run simulate:repaired` exits with code 4 and emits `HUMAN_REVIEW`.
4. Repeating an audit produces the same receipt ID.
5. Dashboard interactions work at desktop and mobile widths without console errors.
