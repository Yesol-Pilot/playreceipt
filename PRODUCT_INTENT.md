# PlayReceipt Product Intent

## One-line promise

PlayReceipt turns scattered game-build telemetry into a stable, inspectable release verdict: `PASS`, `REPAIR`, `HUMAN_REVIEW`, or `UNVERIFIED`.

## Target user

AI-assisted browser-game teams that can generate code faster than they can prove the result is reliable, balanced, accessible, and genuinely playable.

The primary evaluator journey is now hands-on: a judge can paste a game evidence document, produce a receipt without credentials, download it, and run the identical gate in CI.

## First 10 seconds

1. Read **Build passed. Game failed.**
2. See the `REPAIR` verdict on real project evidence.
3. Switch to the repaired sandbox and see that all machine-verifiable gates pass while human fun calibration remains honestly open.
4. Open **Audit your evidence**, submit the included JSON, and download the resulting receipt.

## Core loop

`evidence JSON → deterministic gates → content-addressed receipt → targeted repair plan → re-audit → CI enforcement`

## Differentiation

- It audits behavior evidence, not source-code style.
- It separates machine-verifiable quality from human judgment instead of inventing a fake universal score.
- The receipt ID is derived from canonicalized inputs and verdicts, so the same evidence produces the same result.
- A real, imperfect project snapshot ships beside a deterministic before/after sandbox.
- The live app accepts a judge-supplied evidence document and returns the same schema as the CLI and GitHub Action.
- The repair trail names failed gates without mutating or overstating the source evidence.

## Non-goals

- It is not a generic CI dashboard.
- It does not claim that automated metrics prove fun.
- It does not modify the audited source project.
- It does not replace human playtesting or accessibility review.

## Kill criteria

Do not submit if the demo cannot show the real evidence case and the deterministic repair case locally, if receipt IDs are unstable, or if the three-minute story needs unsupported claims.
