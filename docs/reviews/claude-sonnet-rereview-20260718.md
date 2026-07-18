# PlayReceipt — Independent Adversarial Re-Review (Developer Tools track)

**OVERALL: REPAIR**
**P0: PASS** · **P1: PASS**
*(P0/P1 artifact sets remain internally honest and unchanged; REPAIR is driven by two NEW implementation regressions introduced while fixing the prior review's findings.)*

## Revised Scores

| Dimension | Score |
|---|---:|
| Technical implementation | 13 / 25 |
| Design | 21 / 25 |
| Potential impact | 17 / 25 |
| Quality of idea | 21 / 25 |
| **Total** | **72 / 100** |

Technical dropped sharply: two attempts to close prior findings each introduced a fresh, more severe defect. Design rose slightly (real accessibility/escaping/UNVERIFIED-surfacing wins). Impact dropped because a judge running the README exactly as written now hits a thrown error and a silently-wrong result.

## Prior-blocker disposition

**B1 — documented `--out` flag: CLOSED (for the documented `--out` form).** `src/cli.js:12-19` now parses `--out <path>` as a real flag distinct from positional operands, and correctly binds `arg`/`output` when `--out` is present. Verified against `docs/evidence/verification-20260718.json:13,19` and `.codex/skills/playreceipt/SKILL.md:13` (`node src/cli.js audit <input.json> --out <receipt.json>`) — both trace correctly. **But this exposed a new regression (B4 below): the same parser is broken whenever `--out` is absent**, which is exactly the form `README.md:29-32` documents.

**B2 — Vercel examples bundling: CLOSED.** `vercel.json:4-8` now adds `"functions": {"api/receipt.js": {"includeFiles": "examples/**"}}`, matching the prior recommendation exactly. (Live deploy re-verification is out of scope per instructions.)

**Typography ≥12px: CLOSED.** Full scan of `public/styles.css` finds no `font-size`/`font` shorthand below 12px anywhere (the previously-flagged `.status{font:9px}`, `.observed,.threshold{font:10px}` are now `font:12px` at `styles.css:20,23,25,27`).

**HTML escaping: CLOSED.** `public/app.js:36-40` defines `escapeHtml()` and it now wraps every interpolated field in `renderBars`, `renderGates` (`gate.label`, `gate.repair`, `formatObserved(gate.observed)`, `gate.threshold`, `labels[gate.verdict]`), and `renderProvenance` (`entry.gate`, `entry.path`).

**UNVERIFIED count: CLOSED.** `public/index.html:60` adds `<b id="count-unverified">` and `public/app.js:89` binds it to `receipt.counts.unverified`.

**Boundary-safe path check: OPEN — new blocker, not a hardening gap.** See B3.

## New blockers

### B3 — `src/server.js` static file serving is completely broken (Severity: Critical; verdict CONFIRMED by trace)
`src/server.js:3` imports `relative` from `node:path`. `src/server.js:35` then declares `const relative = url.pathname === "/" ? "index.html" : url.pathname.slice(1);` inside the same request-handler block, **shadowing the imported function with a string**. Line 38 then calls `relative(publicRoot, filePath)` — invoking that string as a function throws `TypeError: relative is not a function`, caught by the outer `catch` at line 43, which always responds `404 Not found`. This fires for **every non-`/api/receipt` request**, including `/` (which maps through this same branch to `"index.html"`). Result: `npm run demo` (README's documented local-run path) serves 404 for the homepage, `app.js`, and `styles.css` — the entire browser dashboard is unreachable locally; only the raw JSON API works. This was introduced while attempting to harden the previously-flagged prefix-only boundary check (N3 in the prior review) into a `path.relative()`-based check; the hardening itself is sound in concept but never executes. **Repair:** rename the local variable (e.g. `requestPath`) so it doesn't collide with the imported `relative`.

### B4 — `src/cli.js` mis-parses arguments whenever `--out` is absent (Severity: High; verdict CONFIRMED by trace)
`src/cli.js:13,17`: when `--out` is not present, `outIndex = -1`, so `outIndex + 1 = 0`, and the filter `index !== outIndex && index !== outIndex + 1` incorrectly excludes index `0` — the first positional argument — from `operands`. Consequences, confirmed by hand-tracing `process.argv`:
- `node src/cli.js audit examples/overclock-20260717.json` (README:29) → `arg` is `undefined` → throws `"audit requires an input JSON path"` even though a path was given.
- `node src/cli.js simulate repaired` (README:32) → `arg` is `undefined` → `mode = arg ?? "broken"` silently falls back to **"broken"**, producing the wrong receipt with no error, directly against the product's own "evidence, not vibes / no silent fabrication" thesis.
- `node src/cli.js simulate broken` (README:30) happens to still work only because the default mode coincides with the requested one.
**Repair:** compute the exclusion set correctly (e.g. only exclude when `outIndex >= 0`), and add a test for the bare (no `--out`) invocation form the README documents.

## Submission recommendation

**Do not submit as-is.** Both new defects are small (one-line fixes) but land squarely on the product's own honesty claim — one crashes the documented primary command, the other silently returns the wrong answer, and the third makes the local browser demo unreachable. Fix B3 and B4, add regression tests for the bare (no `--out`) CLI forms and a static-asset smoke test, then re-review; the underlying idea, engine determinism, and phase artifacts remain strong.
