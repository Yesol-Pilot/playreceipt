# Design Fidelity Ledger

Reference: `playreceipt-dashboard-concept-v1.png`  
Current implemented captures: `../evidence/browser/playreceipt-uplift-custom.png` and `../evidence/browser/playreceipt-uplift-mobile.png`

The generated concept was used as a layout reference only. Its fictional project data, dates, file locations, runtime metadata, and gate results were rejected.

| Reference feature | Implementation decision |
|---|---|
| Persistent left case rail | Implemented with three inspectable bundled cases plus a fourth judge-supplied JSON audit path |
| One large verdict beside the thesis | Implemented; verdict is computed from the live receipt API |
| Gate matrix with observed, threshold, status | Implemented for all eight gates; repair text remains attached to the failing claim |
| Policy visualization | Simplified to the comparison that matters: best strategic policy vs random baseline |
| Evidence and provenance panel | Implemented from gate evidence paths; no fictional cloud URLs |
| Dense industrial visual language | Implemented with restrained ink/red/acid/amber semantics and readable responsive states |

Intentional deviations:

1. The concept's fake build metadata was replaced by receipt ID, source kind, and evidence date.
2. Decorative icons were removed to keep the interface code-native and evidence-first.
3. `HUMAN_REVIEW` is preserved as a distinct outcome; it is never counted as a repair or pass.
4. Mobile uses a 2×2 four-case switcher and stacked gate rows rather than compressing the desktop table; the full-page 390px readback retains all eight gates and the human boundary.
5. The app uses a zero-dependency static frontend for auditability and deadline reliability instead of adding a framework solely for presentation.
