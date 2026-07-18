# PlayReceipt Devpost v3 update package

Apply only after the independent uplift review is `PASS`, public main matches the reviewed commit, Vercel live verification passes, and the v3 YouTube watch page passes 1080p/audio/metadata readback.

## Immutable identifiers

- Project: `PlayReceipt`
- Track: `Developer Tools`
- Primary Codex Session ID: `019f6f06-9f9a-7042-a4be-9292df9fb7cf`
- Live app: `https://playreceipt.vercel.app`
- Repository: `https://github.com/Yesol-Pilot/playreceipt`
- New video: `{{V3_PUBLIC_YOUTUBE_URL}}`

## Tagline

Evidence, not vibes, for AI-built games.

## Testing instructions

### Fastest path — no install, no account

1. Open https://playreceipt.vercel.app.
2. Select **Audit your evidence**.
3. Keep the preloaded JSON and select **Issue receipt**.
4. Confirm `HUMAN_REVIEW`, `7 PASS · 0 REPAIR · 1 HUMAN · 0 MISSING`, and the four-stage trail.
5. Select **Copy receipt JSON**. The receipt is the exact audited output; the server stores no submission history.

### CI path

```yaml
- uses: Yesol-Pilot/playreceipt@main
  id: receipt
  with:
    evidence: examples/repaired-evidence.json
```

`REPAIR` and `UNVERIFIED` fail the job. `HUMAN_REVIEW` succeeds with a warning instead of becoming a false `PASS`.

## Required story copy

Use `docs/demo/DEVPOST_SUBMISSION.md` as the complete field source after replacing its public video URL and current independent-review sentence with the verified v3 values.

The first two paragraphs visible to judges must preserve this sequence:

1. A green build does not prove a game is shippable.
2. PlayReceipt turns supplied reliability, balance, accessibility, and human-play evidence into one of four honest receipts.
3. Judges can audit their own JSON with no account and run the same engine in GitHub Actions.
4. Simulation can verify mechanics and reliability; it cannot certify fun.

## Gallery package

| Order | Asset | Caption |
|---:|---|---|
| 1 | `docs/demo/playreceipt-uplift-v3-thumbnail-1280.png` | A green build can still earn REPAIR. |
| 2 | `docs/evidence/browser/playreceipt-uplift-dialog.png` | Paste judge-supplied evidence. No account, no upload history. |
| 3 | `docs/demo/playreceipt-uplift-gallery-1280.png` | Exact receipt plus the ingest-to-human-boundary trail. |
| 4 | `docs/demo/playreceipt-uplift-ci.png` | One deterministic engine across browser, API, CLI, and GitHub Action. |
| 5 | `docs/demo/playreceipt-uplift-mobile-card-1280.png` | True 390px readback: all eight gates retained, no horizontal overflow, zero console errors. |

## Save and submission readback

Do not treat the form save as proof. After submitting:

1. Open the public Devpost project page in a signed-out/public context.
2. Confirm the new YouTube URL, live app, repository, track, and updated story text.
3. Confirm the submission remains entered in OpenAI Build Week, not merely saved to the portfolio.
4. Capture the public page and submitted-state UI.
5. Record the final URLs, reviewed commit, timestamp, and screenshots in a new versioned Devpost receipt.
