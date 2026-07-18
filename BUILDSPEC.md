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
- Credential-free **Audit your evidence** workflow accepting a game-evidence JSON document up to 64 KiB.
- Copyable and downloadable JSON receipt produced from the exact audited input.
- Visible audit trail separating evidence ingestion, deterministic judgment, repair plan, and human boundary.
- Repository-root GitHub Action exposing `verdict` and `receipt-id` outputs and failing CI on `REPAIR` or `UNVERIFIED`.

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
- `public/schema/game-evidence.schema.json` documents the interoperable input contract while allowing partial bundles to become `UNVERIFIED`.
- Source evidence remains unmodified and is copied with provenance.
- POST audit requests reject non-JSON, malformed, or oversized bodies without persisting input.
- Browser, CLI, API, and GitHub Action use the same `auditGameEvidence` implementation.
- Downloaded receipts contain no hidden score or invented evidence.

## Demo acceptance

1. `npm test` passes.
2. `npm run simulate:broken` exits with code 2 and emits `REPAIR`.
3. `npm run simulate:repaired` exits with code 4 and emits `HUMAN_REVIEW`.
4. Repeating an audit produces the same receipt ID.
5. Dashboard interactions work at desktop and mobile widths without console errors.
6. A valid custom POST returns the same receipt as direct engine invocation.
7. Malformed and oversized custom POST requests fail closed.
8. The GitHub Action writes stable outputs and emits CI annotations for failed gates.
9. A judge can complete paste → audit → copy or download in under 30 seconds without authentication.

## 120-point uplift boundary

The uplift does not add a synthetic score, auto-fabricate repaired evidence, or claim universal rule coverage. It makes the existing epistemic boundary operational across live UI, API, CLI, Codex skill, and CI. The original submitted video and evidence remain preserved; upgraded artifacts receive new versioned paths and URLs.
