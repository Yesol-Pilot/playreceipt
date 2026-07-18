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

## How we built it

We used Codex and GPT-5.6 to turn the release decision into a deterministic Node.js audit engine, CLI, seeded simulator, HTTP API, responsive evidence dashboard, and repository-local Codex skill. Identical canonical evidence produces an identical SHA-256 receipt ID. CLI exit codes make the verdict usable by agents and CI.

The implementation has no runtime npm dependencies. Seven regression tests cover missing evidence, stable receipts, documented command forms, static-path boundaries, and the live HTTP dashboard. The public Vercel deployment and every source claim are independently inspectable.

## Challenges

The hard part was not generating more metrics; it was preserving epistemic boundaries. Reliability evidence must not become a claim about fun. A repaired machine-verifiable state must not silently become `PASS`. Existing game evidence also had to remain isolated, read-only, and clearly separated from new Build Week work.

Independent review found two real defects in the documented CLI and HTTP path handling. We repaired both, converted them into regression tests, and reran the full suite. The final independent review scored the result 90/100 and passed all P0/P1 gates.

## Accomplishments

- A real evidence case that demonstrates why a green build can still be unshippable.
- Stable, content-addressed receipts and CI-friendly exit codes.
- Four verdicts that preserve missing evidence and human judgment.
- A repository-local Codex skill that can normalize evidence and rerun the same audit after repair.
- A public deployment, public source, public voiceover demo, deterministic tests, and independent review trail.

## What we learned

The most useful developer tool is sometimes a refusal to overclaim. Separating `HUMAN_REVIEW` from `PASS`, and `UNVERIFIED` from `REPAIR`, makes AI-assisted development more trustworthy and more actionable.

## What's next

Next we will add adapters for common browser-game telemetry, signed receipt bundles for CI, configurable rule packs, and a human playtest capture workflow that can close the final calibration gate without weakening its provenance.

## Build Week provenance

PlayReceipt is new work created for OpenAI Build Week. The existing game contributes only three read-only evidence artifacts under `examples/source/overclock/`; the product intent, audit engine, simulator, interface, tests, receipts, documentation, and deployment are new. The public repository contains the source-boundary decision record and hashes.

## Feedback field

Primary Codex Session ID: `019f6f06-9f9a-7042-a4be-9292df9fb7cf`
