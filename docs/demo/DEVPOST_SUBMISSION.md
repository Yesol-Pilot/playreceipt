# Devpost submission copy

## Title

PlayReceipt

## Tagline

Evidence, not vibes, for AI-built games.

## One-line pitch

PlayReceipt turns reliability, balance, accessibility, and human-play evidence into a reproducible release receipt without pretending simulation can certify fun.

## Track

Developer Tools

## Links

- Live app: https://playreceipt.vercel.app
- Public repository: https://github.com/Yesol-Pilot/playreceipt
- Public demo video: https://youtu.be/9M4A2hQYgps
- Primary Codex Session ID: `019f6f06-9f9a-7042-a4be-9292df9fb7cf`

## Inspiration

AI coding tools can turn a red build green quickly, but a green build does not prove that player choices matter, accessibility controls exist, or a game is fun. We needed a release gate that makes those missing claims visible instead of compressing them into a flattering synthetic score.

## What it does

PlayReceipt audits eight explicit gates across reliability, balance, accessibility, and human calibration. Every gate shows observed evidence, its threshold, provenance, status, and the smallest credible repair. The final verdict is one of four honest outcomes: `PASS`, `REPAIR`, `HUMAN_REVIEW`, or `UNVERIFIED`.

The default case uses a real, read-only game evidence snapshot. It completed 2,000 deterministic runs with zero crashes and stalls, but weak strategy separation, missing reduced-motion proof, and no human fun calibration correctly keep it at `REPAIR`. A repaired sandbox passes seven machine-verifiable gates, yet still stops at `HUMAN_REVIEW` because automation cannot certify fun.

Judges can also paste their own evidence JSON into the live app with no account. PlayReceipt returns a copyable and downloadable exact receipt plus an explicit `INGEST → JUDGE → REPAIR PLAN → HUMAN BOUNDARY` trail. Requests are capped at 64 KiB, and PlayReceipt has no database or submission-history write path.

## How we built it

We used Codex and GPT-5.6 to turn the release decision into one deterministic Node.js audit engine consumed by the CLI, seeded simulator, HTTP API, responsive dashboard, repository-local Codex skill, and dependency-free GitHub Action. Identical canonical evidence produces an identical SHA-256 receipt ID. The action fails CI on `REPAIR` or `UNVERIFIED`, while `HUMAN_REVIEW` remains a visible warning instead of a manufactured pass.

The implementation has no runtime npm dependencies. Eleven regression tests cover missing evidence, stable receipts, documented command forms, POST abuse boundaries, Vercel adapter parity, GitHub Action semantics, GitHub expression safety, static-path boundaries, and the live HTTP dashboard. The public Vercel deployment and every source claim are independently inspectable.

Codex was the engineering control loop, not a decorative tool. It challenged an early single-score direction, helped lock the four-verdict contract, implemented each adapter against one engine, drove browser QA at desktop and 390px, and turned adversarial review findings into permanent regression tests. We made the key product choice to keep fun outside machine `PASS`, the key architecture choice to make receipts content-addressed, and the key design choice to present a forensic ledger instead of a generic dashboard.

## Challenges

The hard part was not generating more metrics; it was preserving epistemic boundaries. Reliability evidence must not become a claim about fun. A repaired machine-verifiable state must not silently become `PASS`. Existing game evidence also had to remain isolated, read-only, and clearly separated from new Build Week work.

Independent review of the base submission found two real defects in the documented CLI and HTTP path handling. We repaired both, converted them into regression tests, and reran the full suite; that base version then received a 90/100 independent review. The interactive/CI uplift is tracked as a separate P2 gate and is not represented as reviewed until its current commit range passes a fresh read-only review.

## Accomplishments

- A real evidence case that demonstrates why a green build can still be unshippable.
- Stable, content-addressed receipts and CI-friendly exit codes.
- A judge-supplied live JSON audit with an exact receipt handoff and no account.
- A reusable GitHub Action powered by the same audit engine as the UI, API, and CLI.
- Four verdicts that preserve missing evidence and human judgment.
- A repository-local Codex skill that can normalize evidence and rerun the same audit after repair.
- A public deployment, public source, public voiceover demo, deterministic tests, and independent review trail.

## What we learned

The most useful developer tool is sometimes a refusal to overclaim. Separating `HUMAN_REVIEW` from `PASS`, and `UNVERIFIED` from `REPAIR`, makes AI-assisted development more trustworthy and more actionable.

For a judge, the value is testable in under thirty seconds: paste the bundled evidence, issue a receipt, copy its JSON, and then run the same file through the GitHub Action. The receipt ID and verdict remain consistent because the UI and CI do not have separate truth systems.

## What's next

Next we will add adapters for common browser-game telemetry, signed receipt bundles, configurable rule packs, and a human playtest capture workflow that can close the final calibration gate without weakening its provenance.

## Build Week provenance

PlayReceipt is new work created for OpenAI Build Week. The existing game contributes only three read-only evidence artifacts under `examples/source/overclock/`; the product intent, audit engine, simulator, interface, tests, receipts, documentation, and deployment are new. The public repository contains the source-boundary decision record and hashes.

## Feedback field

Primary Codex Session ID: `019f6f06-9f9a-7042-a4be-9292df9fb7cf`
