# G1 Evidence — Accessibility + Legibility (2026-07-17, quality loop iter 4)

## Photosensitivity first-boot gate (04_MASTERPIECE_STANDARDS §C — release stop-line)

Live-verified in browser (structured readback, seed 20260717, no glitch param):

| Check | Result |
|---|---|
| Prompt renders BEFORE any PIXI/canvas | PASS — `gameBootedBeforeChoice: false`, `canvasExists: false` at prompt time |
| Three tiers offered | PASS — 풀 이펙트 / 저자극 모드 / 안정 모드 |
| ARIA dialog role + label | PASS — `role=dialog`, `aria-label=시각 효과 설정` |
| Choosing STABLE attaches no glitch filter | PASS — `filterAttached: false`, `glitchMode: stable` |
| Choice persists | PASS — `localStorage[overclock.glitchMode] = stable` |
| URL `?glitch=` overrides + skips prompt | PASS (used throughout S3 verification) |

Precedent basis: Cyberpunk 2077 shipped seizure-inducing sequences and patched reactively; we gate before first render (Celeste-style pre-boot prompt).

## Toggle-parity (mechanics identical across glitch modes)

VERIFIED BY ARCHITECTURE: `glitchMode` is passed only to `BattleScene` and touches only `this.glitch`/`filters`. The entire mechanics layer (RunManager, PipelineSystem, EncounterAI, EntropyDirector, CompanionCore) has no glitch input and is a pure function of (seed, inputs) — proven by the S1/S2 determinism tests + the headless 2000-run soak, which runs with no scene at all. Reduce Glitch STABLE therefore cannot alter outcomes.

## Glitch tier on-screen (twist #2 payoff)

- Filter application proven by A/B pixel-diff: intensity 0→1.0 changed 16,882 / 57,600 sampled pixels (29%).
- Kernel band (entropy 95, intensity 0.55) frame archived: `s3-ui/kernel-glitch-tier-20260717.png` — RGB channel split, scanlines, row displacement, corrupted entropy readout.
- HONEST: SEVERE tier (entropy 76-90, intensity 0.32) reads subtly on a static frame — flagged as an art-pass tuning item (raise mid-tier intensity or add a distinct mid-band effect), not a blocker.

## Steam Deck legibility (PS5: >=9px hard floor, >=12px target at 1280x800)

Audit of all flagship UI font sizes: min was 10px (glitch tag) and 11px (card type label) — both above the 9px floor but below the 12px target. REPAIRED both to 12px this iteration. All flagship UI text now >=12px. Design space 1280x720 scales ~1:1 horizontally onto a 1280x800 Deck panel, so px map is faithful. On-device capture deferred to hardware-QA (owner/Heejin).

## Remaining accessibility items (S5/S6)

- `Reduce Motion/Shake` separate toggle (TraumaSystem) — not yet wired (TraumaSystem is v1, flagship uses GlitchFilter only so far).
- Colorblind: BIO GREEN / FATAL RED / DEEP PURPLE encoded by color today; icon+shape+text redundancy is partial (type labels + intent text exist) — full CVD pass at S5 art.
- WCAG 2.3.1 flash-budget instrument test on the worst-case kernel capture — deferred to S6 with a PEAT/Harding-style pass.
