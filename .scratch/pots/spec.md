# Pots Page and Pot Management

Status: ready-for-agent

## Problem Statement

Users can see savings pots on Overview but cannot open a dedicated Pots page, manage savings goals, or move money into and out of them. Overview's pots and balance currently come directly from bundled demo data, so introducing editable pots without shared financial ownership would leave summaries inconsistent.

Users need a responsive, coherent view of their savings goals and a safe way to create, edit, delete, fund, and withdraw from pots. Money reserved in pots must remain distinct from available Current Balance without being mistaken for income or expenditure.

## Solution

Build the responsive Pots page and management dialogs following the supplied desktop, tablet, mobile, menu, and modal designs. Enable Pots navigation and Overview's See Details entry point.

Support creating, editing, and deleting pots, plus Add Money and Withdraw as internal transfers between Current Balance and a pot. Keep Overview and Pots synchronized throughout the running app session; reload restores bundled demo data. Show live transfer previews without committing changes before confirmation.

Treat savings targets as goals rather than caps. Deleting a funded pot returns its savings to Current Balance rather than losing money. Preserve the initial demo finances: the bundled Current Balance already excludes the money held in existing pots.

## User Stories

1. As a user, I want to open Pots from app navigation, so that I can inspect and manage savings goals.
2. As a user, I want Overview's pot See Details action to open Pots, so that I can move from a summary to its details.
3. As a user, I want navigation to identify Pots as the active destination, so that I know where I am.
4. As a user, I want the initial pots and their order to match the bundled demo data on every viewport, so that responsive layouts do not change my finances.
5. As a user, I want each pot to show its name, theme, saved amount, target, percentage, and progress bar, so that I can understand its position.
6. As a user, I want monetary detail to retain cents, so that small transfers remain visible.
7. As a user, I want actual saved amounts and percentages retained above the target, so that exceeding a goal is not hidden.
8. As a user, I want progress bars visually capped at full, so that overfunded pots do not break the layout.
9. As a user, I want to create a pot through Add New Pot, so that I can start another savings goal.
10. As a user, I want a new pot to start with zero savings, so that creation does not silently move money.
11. As a user, I want a pot name trimmed and limited to 1–30 characters, so that it is meaningful and fits the form contract.
12. As a user, I want names to be unique ignoring case and surrounding whitespace, so that similarly named pots are not confused.
13. As a user, I want a positive target with at most two decimal places, so that it represents a valid USD goal.
14. As a user, I want invalid monetary input rejected rather than silently rounded, so that the saved value matches my intention.
15. As a user, I want a named color palette with swatches, so that I can recognize and choose a pot theme.
16. As a user, I want colors already assigned to other pots unavailable, so that pots remain visually distinct.
17. As a user, I want budget colors independent of pot colors, so that one feature does not reserve choices in the other.
18. As a user, I want a new pot appended to the list, so that existing order remains predictable.
19. As a user, I want each pot's management menu to offer Edit Pot and Delete Pot, so that management actions are discoverable.
20. As a user, I want Edit to preload the saved name, target, and theme, so that I can make focused changes.
21. As a user, I want to retain a pot's current name and theme during editing, so that uniqueness rules do not reject unchanged values.
22. As a user, I want edits to preserve the saved amount and Current Balance, so that changing a goal does not move money.
23. As a user, I want to lower a target below the saved amount, so that a changed goal does not discard savings.
24. As a user, I want an edited pot to retain its identity and list position, so that editing does not reorder my goals.
25. As a user, I want Add Money to transfer from Current Balance to the selected pot, so that I can reserve available funds.
26. As a user, I want an addition limited by Current Balance, so that I cannot reserve unavailable money.
27. As a user, I want to add beyond a pot's target, so that the goal does not act as an artificial savings cap.
28. As a user, I want Withdraw to transfer savings back into Current Balance, so that I can make reserved money available again.
29. As a user, I want withdrawals limited by the selected pot's saved amount, so that a pot cannot become negative.
30. As a user, I want to withdraw all of a pot's savings without deleting it, so that I can keep the goal for future use.
31. As a user, I want positive transfer amounts with at most two decimal places, so that transfers represent valid USD amounts.
32. As a user, I want excessive transfers rejected rather than silently clamped, so that confirmation never submits a different amount from the one I entered.
33. As a user, I want live previews of the resulting saved amount, percentage, and progress, so that I can understand a transfer before confirming it.
34. As a user, I want the existing savings and proposed change distinguished in the preview bar, so that I can recognize the transfer's effect.
35. As a user, I want blank or invalid transfer input to leave the preview at its saved state, so that invalid input does not suggest an accepted transfer.
36. As a user, I want validation explained inline on submission without closing the dialog, so that I can correct mistakes.
37. As a user, I want previewing a transfer to leave financial state unchanged, so that typing is not mistaken for confirmation.
38. As a user, I want a successful confirmation to move money exactly once, so that repeated interaction does not duplicate a transfer.
39. As a user, I want internal transfers excluded from Income, Expenses, and transaction history, so that reserving savings is not misrepresented as spending or earnings.
40. As a user, I want deletion to require explicit confirmation naming the pot, so that accidental removal is less likely.
41. As a user, I want deletion confirmation to state the saved amount being returned to Current Balance, so that I understand the financial effect.
42. As a user, I want deleting a funded pot to return all its savings before removing it, so that no money is lost.
43. As a user, I want canceling deletion to leave both the pot and balance unchanged, so that I can safely reconsider.
44. As a user, I want a deleted pot's name and theme available for reuse, so that removal does not reserve obsolete choices.
45. As a user, I want pot changes immediately reflected on Overview, so that navigating does not reveal stale savings information.
46. As a user, I want Current Balance immediately updated by transfers and funded-pot deletion, so that available funds remain accurate.
47. As a user, I want Total Saved to include every pot, including those outside the visible summary area, so that the total is complete.
48. As a user, I want changes retained while navigating within the app, so that leaving Pots does not discard confirmed work.
49. As a demo user, I want reload to restore the original pots and balance, so that the session-only behavior is predictable.
50. As a user, I want the initial Current Balance left unchanged when existing pots are loaded, so that savings are not deducted twice.
51. As a user, I want Close, Escape, backdrop click, and Cancel where offered to discard drafts, so that I can leave without making changes.
52. As a user, I want a reopened form to contain fresh Add values or saved existing values, so that canceled drafts do not leak into later work.
53. As a user, I want Withdraw disabled for an empty pot, so that an impossible transfer cannot be started.
54. As a user, I want Add Money disabled when Current Balance is zero, so that an unfundable transfer cannot be started.
55. As a user, I want Add New Pot disabled when every pot theme is in use, so that I do not open an unsatisfiable creation form.
56. As a user, I want disabled actions presented without extra explanatory text, so that the interface remains uncluttered.
57. As a user, I want a useful invitation to create a pot after deleting all pots, so that the empty page gives me a next step.
58. As a user, I want Overview to show zero Total Saved and no stale entries when all pots are deleted, so that the summary remains accurate.
59. As a keyboard user, I want accessible management menus, fields, selectors, and transfer actions, so that I can complete every journey without a pointer.
60. As a keyboard user, I want labeled dialogs, initial focus, focus containment, and sensible restoration, so that dialog interaction is predictable.
61. As a user, I want background content isolated while a modal is open, so that I do not accidentally interact with the page underneath.
62. As a mobile or short-viewport user, I want forms and dropdowns to fit and scroll without clipping actions, so that every control remains reachable.
63. As a user, I want content and focus clear of fixed navigation, so that the app shell does not obstruct my work.
64. As a user, I want responsive layouts to follow the supplied designs without horizontal overflow, so that the page remains usable across desktop, tablet, and mobile.
65. As a developer, I want financial journeys protected at the rendered-app boundary, so that refactoring presentation or state ownership does not invalidate behavior-focused tests.

## Implementation Decisions

### Ownership, scope, and navigation

- Retain the existing Vue, TypeScript, Router, Pinia, and Tailwind foundations. Introduce the dedicated Pots destination using existing route conventions.
- Enable Pots in app navigation and Overview's pot See Details action. Derive the current destination from the route; preserve the state of unrelated destinations.
- Introduce shared reactive ownership for pots and Current Balance rather than independent page copies or setup-time summary calculations. Overview and Pots must consume the same financial state.
- Initialize mutable state from copies of bundled demo records. Do not mutate the bundled dataset to represent user changes.
- Preserve initial demo records, values, and order across all viewports rather than reproducing differing reference examples. New pots append; edits retain position and logical identity. Do not use an editable name as immutable identity.
- Session changes survive route navigation but not reload or a new app instance. Do not introduce browser storage, APIs, or a backend.

### Financial model

- The initial demo Current Balance already excludes existing pot savings. Loading pots must not subtract their amounts again.
- Add Money transfers a positive amount from Current Balance into one pot. Withdraw performs the reverse transfer. Each operation updates the two values together or makes no change.
- Additions may not exceed available Current Balance; withdrawals may not exceed the selected pot's saved amount. Exact-balance additions and exact-total withdrawals are allowed.
- Internal transfers do not change Income, Expenses, or transaction records. Deleting a funded pot is likewise not income.
- Deleting a pot returns its entire saved amount to Current Balance and removes it as one confirmed operation. Creation and metadata edits never move money.
- Across additions, withdrawals, and deletion, Current Balance plus Total Saved is conserved. All monetary mutations must use cent-safe arithmetic and reject nonfinite or unsafe amounts, excess precision, blank, nonnumeric, zero, and negative transfer/target values rather than silently rounding or clamping.
- A target is a goal, not a cap. Adding above the target and editing a target below existing savings are allowed. Actual saved amounts and percentages remain truthful above 100%; visual bars cap at full.
- Derive Total Saved from all current pots, including entries outside the visible Overview summary region. Preserve existing app currency conventions and visible cents in detailed monetary values.

### Page and shared presentation

- Build pot-specific card presentation with name/theme, saved amount, target, percentage, progress, management menu, Add Money, and Withdraw actions.
- Follow supplied responsive page references for card arrangements and spacing, adapting only approved data and behavior differences. Preserve demo order at all widths.
- Reuse the existing modal shell, buttons, inputs, theme selector, icon assets, typography presets, and theme tokens. Extend a shared control only for a design-evidenced gap; do not introduce a broad card/form framework or a parallel visual vocabulary.
- Keep page-level dialog orchestration and financial mutations separate from card presentation. Reuse pot metadata form behavior between Add and Edit; keep transfer-specific preview and validation separate from metadata editing.
- Use the fixed existing theme palette, with named colors and swatches. Themes assigned to other pots are visible but unavailable, following established selector conventions. Budget usage does not reserve pot themes, and pot usage does not reserve budget themes.

### Creation, editing, and deletion

- Add accepts name, target, and theme, and creates a pot with zero savings. It does not include an initial funding field.
- Names are trimmed, required, and 1–30 characters; uniqueness ignores case and surrounding whitespace. Editing excludes the current pot from uniqueness checks.
- Targets are positive USD amounts with at most two decimal places and safe cent representation. Invalid input stays in the dialog with an inline explanation; successful submission closes it and updates shared state.
- Edit preloads saved metadata and allows retaining the current name and theme. It preserves savings and Current Balance, even if the target becomes less than the saved amount.
- Deletion confirmation names the pot and explicitly states the saved amount that will return to Current Balance. Confirming removes the pot and releases its name and theme; canceling changes nothing.
- Make destructive actions distinguishable and keep menu behavior consistent with Budgets. No undo or extra unsaved-change confirmation is required.

### Transfers and previews

- Add Money and Withdraw open dialogs for the selected pot with an initially blank transfer amount. No financial mutation occurs merely by opening or typing in a dialog.
- For valid positive input within the applicable balance limit, preview the resulting saved amount, percentage, and segmented progress bar live. Distinguish existing savings from the proposed added or withdrawn portion according to the supplied modal designs.
- Preview percentages and values reflect projected savings; over-target values remain visible while graphical segments fit the capped bar.
- Blank or invalid input, including excessive additions or withdrawals, leaves the preview at the persisted saved state. Explain invalid input inline on submission and retain the dialog for correction. Do not clamp an invalid amount into a different valid transfer.
- Confirmation validates against current shared state, commits the transfer exactly once, updates Overview and Pots immediately, and closes the dialog. Ensure repeated activation cannot duplicate a successful operation.

### Disabled actions, empty states, and accessibility

- Disable Withdraw when the pot is empty, Add Money when Current Balance is zero, and Add New Pot when no pot theme remains available. Do not add explanatory text or disabled-reason descriptions for those buttons. Retain their normal accessible action names and native disabled semantics.
- Availability updates after transfers or deletion. Returning funds can reenable Add Money; deleting a pot releases a theme and can reenable creation.
- After deleting every pot, show a useful empty-state invitation with a working creation path. Overview shows zero Total Saved and no stale entries. Update any summary help text that currently assumes a fixed number of pots.
- Follow existing Budgets dialog conventions: accessible heading/description association, initial focus, contained keyboard focus, background isolation, scroll locking, and sensible focus restoration.
- Close, Escape, backdrop click, and Cancel where offered discard unsaved changes without a second warning. Clicking within the panel does not dismiss it. Reopened Add/transfer forms are fresh; Edit reloads saved metadata.
- Preserve keyboard usability for management menus and selectors, including disabled choices and Escape ordering. Restore focus to a sensible surviving control when deletion removes the original trigger.
- Support small and short viewports with reachable dialog actions and scrollable selectors; avoid horizontal overflow and fixed-navigation obstruction.

## Testing Decisions

### Agreed seam and test quality

- The owner confirmed rendered-app testing with the real router and isolated shared state as the primary seam, following existing Budgets, deletion, and Overview journey tests.
- Exercise visible content, accessible controls, routes, and externally observable financial outcomes. Do not couple tests to component instances, private store methods, utility classes, implementation snapshots, or production arithmetic used to derive expected answers.
- Prefer one coherent app-boundary seam for Pots, Overview synchronization, Current Balance, and retained transaction history rather than separate tests for every helper, store method, and presentation component.
- Isolate each app/store instance and restore controlled demo fixtures. Navigation within a test retains state; a fresh instance restores initial values. Do not add test-only mutation interfaces to production code.
- Retain existing shared-control contract tests. Add focused reusable-control coverage only for genuinely new behavior not adequately protected by app journeys.

### Fast rendered-app coverage

- Verify demo pot content and order, initial Total Saved, and unchanged initial Current Balance. Prove initial pot savings are not deducted again.
- Navigate through app navigation and Overview See Details, assert route-active state, and preserve unrelated navigation behavior.
- Create a pot through visible controls; assert zero initial savings, appended order, unchanged balance, shared Overview update, and independent budget/pot color availability.
- Cover trimmed names, case-insensitive duplicates, whitespace-only names, length boundaries, unchanged names during Edit, and released names after deletion.
- Cover invalid targets and transfers: blank, zero, negative, nonnumeric, nonfinite, unsafe monetary values, and excess precision. Verify no rounding/clamping, mutation, or dismissal; correcting input permits successful submission.
- Cover fixed theme options, disabled used colors, retention of an edited pot's theme, palette exhaustion, disabled creation without explanatory text, and recovery after deletion.
- Edit every metadata field, lower a target below savings, and verify saved money, balance, identity/order, and Overview synchronization remain correct.
- Add a valid cents amount and verify the selected pot and Current Balance change by equal opposite amounts. Cover exact available-balance addition, rejection above availability, and addition beyond the target.
- Withdraw a valid cents amount and verify equal opposite changes. Cover exact-total withdrawal, resulting zero savings, and rejection above the saved amount.
- Assert Current Balance plus Total Saved is conserved for additions, withdrawals, and funded-pot deletion using explicit expected financial values, including repeated cent transfers.
- Assert Income, Expenses, and transaction history remain unchanged throughout financial journeys. Budget and transaction browsing must not acquire transfer records.
- Verify live projected savings and percentages for valid input; blank or invalid input retains the saved-state preview. Typing alone must not change Overview or shared financial state.
- Cover over-target saved amounts and percentages, zero savings, exact target, and capped graphical progress without relying on implementation-specific class assertions.
- Verify confirmation commits once and closes; repeated activation cannot duplicate a transfer.
- Cancel Add, Edit, transfers, and deletion through supported close/Escape/backdrop/Cancel paths. Reopen to verify fresh drafts or saved values and no financial leakage.
- Delete funded and empty pots, check explicit named confirmation and return amount, verify balance conservation, and confirm release of name/theme.
- Verify disabled Withdraw at zero and disabled Add Money at zero Current Balance, without additional explanatory text. Verify reenablement after appropriate financial changes.
- Delete every pot, verify empty-state invitation, zero Overview Total Saved, no stale entries or fixed-count summary help, and successful creation afterward.
- Follow mutation journeys from Pots to Overview and back to prove shared updates and session retention; instantiate a fresh app to prove demo restoration at the fast seam.
- Preserve existing Overview, Budgets, Transactions, recurring-bill, and shared-control behavior.

### Production browser and visual checks

- Use production-built Chromium checks following the repository's build-first browser-validation workflow, including focused runs. A memory-router test alone is not proof of real reload behavior.
- Complete a browser journey with transfers/edits, navigation to Overview and back, then a real reload restoring original pots and balance.
- Check native dialog initial focus, Tab/Shift+Tab containment, background isolation, scroll locking, Escape ordering, backdrop dismissal, and focus restoration after closing or deleting. jsdom alone is insufficient for native modal behavior.
- Verify responsive page and modal layouts at supplied desktop, tablet, and mobile widths plus narrow/intermediate and short viewports. Check scrolling, dropdown clipping, fixed-navigation clearance, and horizontal overflow.
- Compare the rendered page, menu, metadata dialogs, deletion confirmation, transfer previews, and relevant interaction states with supplied native-resolution design references. Inspect shared controls before adding design variants.
- Verify default, hover, focus, selected/current, disabled, and validation states where applicable, including icon color inheritance, theme swatches, and over-target/empty bars.
- Confirm local fonts/icons/assets resolve in production and that transfer preview segments render correctly, including near-zero and over-target cases.
- Use existing cached design exports before fetching missing references; Pots-specific references were not yet cached during discussion. Retrieve the relevant native-resolution reference images and design context before implementation or parity claims.
- Tests must run without private design access. Keep rendered screenshots, traces, and reports in configured test-artifact locations, never in private reference locations. Do not copy private links, file keys, screenshots, or reference-derived snapshots into tracked source, tests, or public documentation.
- Run the normal fast checks, type checking/build, lint, and relevant browser checks. Explicitly report unavailable reference access or blocked visual checks rather than inferring parity from code inspection.

## Out of Scope

- Backend persistence, authentication, bank integrations, browser storage, cross-tab synchronization, schema migrations, and saved transfer history.
- New transaction records for internal transfers, changes to Income or Expenses, transaction editing, or changes to budget spending calculations.
- Double-deducting initial demo savings, target-based funding caps, negative pots or Current Balance, overdrafts, interest, automatic deposits, recurring transfers, and pot-to-pot transfers.
- Direct editing of saved amounts or funding during pot creation. Funding and withdrawal use their dedicated actions.
- Custom themes, cross-feature color reservation, user-created palettes, new sorting/pagination controls, and matching inconsistent design example data.
- Undo deletion, extra unsaved-change prompts, explanatory text for disabled action buttons, and persistence beyond the app session.
- A generic form generator, broad component framework, replacement modal system, new charting library, and unrelated architecture cleanup.

## Further Notes

- Product behavior was confirmed across two discussion rounds and a final scope summary. The owner accepted the testing seams before publication.
- Canonical definitions for Pot, Current Balance, Add Money, and Withdraw are recorded in the project glossary. Total Saved remains the sum across all pots, not only visible entries.
- Existing Budgets implementation provides shared-modal, selector, management-menu, session-state, and rendered-app testing precedents. Overview's current pot and balance summaries still require migration away from direct demo reads.
- Private design references were supplied for responsive pages and all relevant dialogs/menu states. Their links and file keys are intentionally excluded from this spec; follow the project's local private-reference workflow.
- No new ADR is required for the reversible component and session-state choices captured here. This spec does not claim implementation, test completion, or visual parity.
- This publication creates the feature spec only. Separate implementation tickets can be created later if requested.

## Comments

Published after the owner confirmed the product summary and rendered-app/production-browser testing approach. Ready for implementation; no implementation work was performed as part of spec publication.
