# 02: Create savings pots

**What to build:** Create a zero-savings pot through Add New Pot, then see it appended on Pots and immediately reflected on Overview without moving money.

**Blocked by:** 01 — Browse Pots and connect Overview.

**Status:** resolved

- [x] Add New Pot opens an accessible metadata form using the existing modal, input, button, and theme-selector foundations. Keep metadata form behavior reusable for Edit without creating a generic form framework.
- [x] Accept name, positive USD target, and theme only. New pots start with zero savings; no initial-funding field or Current Balance change is introduced.
- [x] Trim names, require 1–30 characters, and reject duplicates ignoring case and surrounding whitespace. Cover whitespace-only names and length boundaries.
- [x] Reject blank, zero, negative, nonnumeric, nonfinite, unsafe, or excess-precision targets without rounding or closing the dialog; show inline errors and allow correction.
- [x] Offer named palette colors and swatches, with other pots' assigned colors visible but unavailable. Budget themes and pot themes do not reserve each other's colors.
- [x] Disable Add New Pot when no theme is available, using normal accessible naming and native disabled semantics but no extra explanatory text or disabled-reason descriptions.
- [x] Successful submission appends a stable-identity pot, closes the dialog, and updates Overview while preserving all financial totals and existing order.
- [x] Close, Escape, and backdrop dismissal discard drafts without further confirmation; clicking inside does not dismiss. Reopened Add starts fresh.
- [x] Ensure labeled dialogs, initial focus, containment, background isolation, scroll locking, selector keyboard behavior, and sensible focus restoration.
- [x] Cover creation, validation, palette exhaustion, cancellation, Overview synchronization, navigation retention, and fresh-instance demo reset through rendered-app journeys rather than private methods.
- [x] Use production-built Chromium to verify dialog and selector focus/Escape behavior, short/mobile scrolling, responsive geometry, and actual reload reset after creation. Compare relevant form/selector states with private references without making tests depend on them.
- [x] Run normal fast checks and relevant browser checks, preserve existing shared-control and feature behavior, and record validation or blocked checks in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown.

Implementation completed:

- Added a reusable Pot metadata form using BaseModal, BaseInput, BaseSelect, and BaseButton. Creation appends a UUID-identified, zero-savings pot and leaves Current Balance, Income, Expenses, existing order, and Total Saved unchanged.
- Names are trimmed and validated for length and case-insensitive uniqueness. USD targets use the existing strict decimal/cents validation, extracted into a shared parser also consumed by BudgetForm without changing its behavior.
- Pot-only palette reservation leaves Budget themes independent. Exhaustion natively disables Add New Pot without extra descriptions, with heading focus restoration when the opener becomes disabled.
- Rendered-app journeys cover creation, inline errors/correction, name boundaries, invalid/unsafe monetary inputs, cancellation, palette exhaustion, independent palettes, navigation retention, Overview synchronization, and fresh-instance reset.
- `pnpm check` passed: non-fixing lint (one pre-existing warning in `e2e/delete-budget.spec.ts`), type-check, 202 Vitest tests, 8 script tests, and production build.
- `pnpm test:browser` passed all 141 Chromium tests. Focused creation/browsing checks also passed all 21 tests. Browser checks include initial/contained/restored focus, inert background, scroll locking, nested selector Escape, disabled choices, cancellation, real reload reset, full palette exhaustion, and desktop/tablet/mobile/narrow/short geometry.
- Visually compared production captures against cached native-resolution form and responsive references. Reused existing shared-control appearance and theme tokens without new variants or styling exceptions. The first unused demo pot theme is Red (rather than the reference's illustrative Green). Reviewed focused/expanded/disabled states and responsive fit; no private artifacts are test inputs or tracked outputs.
- Independent Standards review: no documented violations or actionable smells. Independent Spec review: no findings. Both reviewed the exact implementation diff against baseline `8513eee6e77cfc63cd0c30e28754e51d4e8b98fd`; validation evidence was supplied separately. No implementation changes followed review.

Edit, Delete, Add Money, and Withdraw remain disabled for their later tickets.
