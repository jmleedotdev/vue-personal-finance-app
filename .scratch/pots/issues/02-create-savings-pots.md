# 02: Create savings pots

**What to build:** Create a zero-savings pot through Add New Pot, then see it appended on Pots and immediately reflected on Overview without moving money.

**Blocked by:** 01 — Browse Pots and connect Overview.

**Status:** ready-for-agent

- [ ] Add New Pot opens an accessible metadata form using the existing modal, input, button, and theme-selector foundations. Keep metadata form behavior reusable for Edit without creating a generic form framework.
- [ ] Accept name, positive USD target, and theme only. New pots start with zero savings; no initial-funding field or Current Balance change is introduced.
- [ ] Trim names, require 1–30 characters, and reject duplicates ignoring case and surrounding whitespace. Cover whitespace-only names and length boundaries.
- [ ] Reject blank, zero, negative, nonnumeric, nonfinite, unsafe, or excess-precision targets without rounding or closing the dialog; show inline errors and allow correction.
- [ ] Offer named palette colors and swatches, with other pots' assigned colors visible but unavailable. Budget themes and pot themes do not reserve each other's colors.
- [ ] Disable Add New Pot when no theme is available, using normal accessible naming and native disabled semantics but no extra explanatory text or disabled-reason descriptions.
- [ ] Successful submission appends a stable-identity pot, closes the dialog, and updates Overview while preserving all financial totals and existing order.
- [ ] Close, Escape, and backdrop dismissal discard drafts without further confirmation; clicking inside does not dismiss. Reopened Add starts fresh.
- [ ] Ensure labeled dialogs, initial focus, containment, background isolation, scroll locking, selector keyboard behavior, and sensible focus restoration.
- [ ] Cover creation, validation, palette exhaustion, cancellation, Overview synchronization, navigation retention, and fresh-instance demo reset through rendered-app journeys rather than private methods.
- [ ] Use production-built Chromium to verify dialog and selector focus/Escape behavior, short/mobile scrolling, responsive geometry, and actual reload reset after creation. Compare relevant form/selector states with private references without making tests depend on them.
- [ ] Run normal fast checks and relevant browser checks, preserve existing shared-control and feature behavior, and record validation or blocked checks in comments.

## Comments

Published from the approved Pots spec and six-ticket breakdown.
