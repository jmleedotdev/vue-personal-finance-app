# 03: Display all savings pots through a scrollable preview

**What to build:** The Overview Pots card, with Total Saved reflecting every supplied Pot and a compact, vertically scrollable preview that makes Holiday reachable without expanding the entire card.

**Blocked by:** 02 — Build the responsive app shell and balance summaries.

**Status:** ready-for-agent

- [ ] Integrate the card into the responsive Overview using the established styling and shared controls; consult the parent spec and private visual references.
- [ ] Derive Total Saved from all five supplied pots and display $920, regardless of which previews are visible.
- [ ] Preserve the demo JSON values: Savings $159, Concert Ticket $110, Gift $110, New Laptop $10, and Holiday $531. Do not replace Gift with the screenshot's $40.
- [ ] Initially show four pot previews in a compact two-column arrangement. Include Holiday in the same list and allow vertical scrolling to reveal it.
- [ ] Keep Total Saved outside the scroll region. Scroll only the preview list, not the whole card, and retain the intended responsive card proportions.
- [ ] Use each pot's supplied name, saved amount, and theme color. Use the supplied local savings icon.
- [ ] Give the scroll region an accessible name and keyboard access; make its extra content discoverable and operable with keyboard, pointer, and touch.
- [ ] Represent the unimplemented Pots detail destination as unavailable, with accessible explanation and no broken or misleading enabled link.
- [ ] Add fast rendered-Overview tests proving all five pots are included, Gift displays $110, and Total Saved is $920 rather than a visible-item subtotal.
- [ ] Verify actual scroll geometry in a focused real-browser check: four previews fit initially, Holiday can be reached by scrolling, and the total stays outside the scrolling content. Do not claim jsdom proves layout or scrolling.
- [ ] Check the desktop, tablet, and mobile arrangement and confirm no new page overflow or bottom-navigation obstruction.
- [ ] Focused tests, type-checking, and the production build pass; keep private design URLs out of tracked content.

**Scope boundary:** Do not build the Pots destination page, add/edit/transfer flows, or persistent storage. Use the existing demo data as-is.
