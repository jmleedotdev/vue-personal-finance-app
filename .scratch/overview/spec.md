# Shared Design System and Responsive Overview

Status: ready-for-agent

## Problem Statement

The app currently contains Vue starter pages rather than the supplied personal-finance design. The owner wants to establish a reusable visual foundation before building the views, then complete the Overview faithfully across desktop, tablet, and mobile.

Implementation should prioritize completing the views with supplied demo data, not building persistence, authentication, offline infrastructure, or a backend prematurely. Repeated styling should remain consistent without accumulating named CSS classes or a heavyweight component framework. Routine validation should be fast rather than relying on a large Playwright suite.

## Solution

First establish a small, Figma-aligned design system: shared colors, local typography, and reusable controls such as buttons and input fields. Then use those foundations to build the responsive app shell and Overview from the three supplied Figma frames.

The Overview displays supplied balance figures, recent transactions, savings pots, August 2024 budget spending, and explicitly defined demo recurring-bill summaries. All five pots contribute to Total Saved and remain reachable through a vertically scrollable preview. Desktop uses a collapsible sidebar; tablet and mobile use bottom navigation. Unimplemented destinations remain clearly unavailable rather than pretending their pages work.

This milestone is a frontend-only, client-rendered Vue SPA. Changes need not survive a refresh. Work on other views, offline operation, registration, and a separate backend follows later and is not specified here.

## User Stories

1. As the app owner, I want shared colors defined once, so that screens and controls use the same visual vocabulary.
2. As the app owner, I want shared typography that matches Figma, so that text hierarchy remains consistent across the app.
3. As a user, I want the supplied Public Sans font loaded locally, so that the UI does not depend on a third-party font service.
4. As a developer, I want Tailwind utilities in Vue templates, so that styling remains visible alongside the markup it affects.
5. As a developer, I want named CSS classes used only when they materially improve clarity or manageability, so that the project avoids an unnecessary parallel styling system.
6. As a developer, I want reusable buttons, so that repeated actions have consistent appearance and behavior.
7. As a keyboard user, I want buttons and links with visible focus states and appropriate semantics, so that I can navigate and activate them reliably.
8. As a user, I want disabled controls to be visibly unavailable and non-operative, so that the interface does not promise actions it cannot perform.
9. As a developer, I want reusable input fields, so that later views can share consistent form controls without building those views now.
10. As a user, I want input labels, disabled states, and error/help associations to be accessible, so that I can understand and operate shared fields.
11. As a developer, I want shared controls to support the variants evidenced by the Figma design, so that their interfaces remain small and grounded in real requirements.
12. As a user, I want a desktop Overview that matches the supplied design, so that I can understand my demo finances at a glance.
13. As a tablet user, I want the same information rearranged for the available width, so that I do not need a desktop-sized viewport.
14. As a mobile user, I want stacked summaries and cards that fit the screen, so that I can read the Overview without horizontal page scrolling.
15. As a desktop user, I want to minimize and restore the sidebar, so that I can choose between navigation labels and a compact menu.
16. As a tablet or mobile user, I want bottom navigation with accessible labels and a clear active item, so that I can identify my current section.
17. As a user, I want unavailable destinations identified honestly, so that navigation and detail actions do not misleadingly appear complete.
18. As a user, I want to see the supplied Current Balance, Income, and Expenses, so that the Overview reflects the demo dataset.
19. As a user, I want Total Saved to include every Pot, so that the total is independent of which previews are currently visible.
20. As a user, I want four pot previews initially visible in a compact two-column arrangement, so that the card retains the design's proportions.
21. As a user, I want to scroll the pot preview vertically to reach Holiday, so that every supplied Pot is available without expanding the whole dashboard.
22. As a keyboard or touch user, I want to operate the pot preview scroll area, so that its extra content is not restricted to mouse users.
23. As a user, I want Total Saved to remain outside the scrollable preview, so that I retain the overall savings context while browsing pots.
24. As a user, I want to see the five recent transactions represented in the design, so that I can scan recent activity.
25. As a user, I want transaction avatars, names, signed amounts, and dates, so that entries are recognizable and income is distinguishable from spending.
26. As a user, I want dates and currency formatted consistently, so that the supplied demo records are easy to read.
27. As a user, I want budget spending evaluated for August 2024, so that the historical demo remains meaningful regardless of today's date.
28. As a user, I want the budget chart's center to show $338 spent against a $975 limit, so that I can see the month's budget overview.
29. As a user, I want budget category names, colors, and limits alongside the chart, so that its presentation has understandable context.
30. As a user, I want the budget legend to move below the chart on mobile, so that labels remain legible at narrow widths.
31. As a user, I want the three recurring-bill summaries shown in Figma, so that the Overview is visually complete before billing rules are implemented.
32. As a developer, I want recurring-bill summary figures explicitly identified as demo fixtures, so that future work does not mistake them for derived billing logic.
33. As a developer, I want imported local icons, logos, and avatars rather than temporary Figma URLs, so that production rendering does not depend on expiring asset links.
34. As the app owner, I want irrelevant starter pages, assets, and assertions removed, so that the repository reflects the product being built.
35. As a developer, I want fast tests of observable behavior and narrowly targeted browser validation, so that verification remains useful without slowing ordinary iteration unnecessarily.

## Implementation Decisions

### Delivery order and architecture

- Establish the shared design system before assembling the Overview. The later ticket breakdown must preserve that order.
- Retain the existing Vue, TypeScript, Vite, Router, and Tailwind stack; use client rendering. There is no requirement for SSR or a framework migration.
- Separate meaningful responsibilities into Vue components: shared controls, responsive navigation, and the Overview's summary sections. Avoid both one monolithic page and a component for every trivial wrapper.
- Reuse shared controls and theme tokens in the assembled screen. Input fields are a foundation for later views, not a reason to add registration or editing forms to the Overview.
- Introduce no hypothetical backend adapter, authentication flow, synchronization engine, or persistent store. Keep data preparation out of presentational templates where it would obscure the UI, without inventing an extensible repository framework.
- Use one responsive screen structure where practical rather than duplicating entire pages for each device.

### Design-system foundations

- Treat the supplied Figma designs and their shared styles/components as the visual authority. Inspect relevant shared control definitions in that file before implementing button and input variants not visible in the Overview frames.
- Define reusable Tailwind theme tokens for the Figma palette, including beige surfaces, neutral text/navigation colors, and the green, cyan, yellow, and navy accents. Reuse these tokens instead of scattering equivalent color literals through templates.
- Use locally supplied Public Sans assets. Establish consistent typography for the evidenced presets: 32px bold with 1.2 line height, 20px bold with 1.2 line height, 16px bold with 1.5 line height, 14px regular/bold with 1.5 line height, and 12px regular with 1.5 line height.
- Use Tailwind utility classes directly in Vue templates. Global CSS may contain Tailwind setup, font declarations, theme tokens, and necessary baseline rules. Named styling classes are exceptions justified by readability or manageability, not the default.
- Build small shared button and input interfaces with native HTML semantics. Keep supported variants tied to the actual designs and required accessible interaction states rather than creating a comprehensive UI library.
- Shared buttons must preserve native activation and disabled behavior. Shared input fields must support labels, value updates, and accessible help/error and disabled states. Do not add unrelated form validation frameworks or product forms.
- Use the supplied SVG assets without rewriting their artwork. Resolve local asset imports correctly for a production build; directory names or JSON-relative URLs alone are not a browser asset-loading strategy.
- Retain font licensing information. Do not add a remote font or icon CDN dependency.

### Responsive shell and navigation

- Match the desktop sidebar, tablet bottom navigation, and mobile icon navigation evidenced by the supplied frames. Select breakpoints based on the layouts and available content width, not three fixed screenshot-only canvases.
- Implement sidebar minimization and restoration in memory, using the supplied appropriate logo/icon assets. Make icon-only navigation and controls accessible by name.
- Clearly mark Overview as the active destination.
- Navigation to unfinished sections and Overview detail actions must not lead to invented feature pages, broken links, or silently ineffective enabled controls. Represent those destinations as unavailable for this milestone, with accessible explanation.
- Keep fixed bottom navigation from covering the final content or keyboard focus. Account for narrow widths and device safe areas.

### Demo data and Overview content

- Preserve the supplied demo JSON as the source dataset. Do not modify its financial values to force agreement with stale screenshot values.
- Treat supplied balance figures as independent demo summary values: Current Balance $4,836.00; Income $3,814.25; Expenses $1,700.50. Do not recompute them from an assumed opening balance or the available transaction subset.
- Render the five recent entries shown in the Overview references, preserving the supplied preview sequence. Resolve their local avatars and show readable dates with positive and negative currency amounts. Avoid timezone-dependent shifts of the demonstrated calendar dates.
- Total Saved is the sum saved across all five pots: $920. Gift is $110, not the screenshot's $40. Holiday contributes $531 even when its preview is outside the visible scroll area.
- Keep the pot preview in a compact two-column layout with four pots initially visible. Include all five entries in the vertically scrollable region; do not simply omit Holiday or make the entire card scroll. Total Saved stays outside this region.
- Use an explicit August 2024 demo reporting period, not the current system month. Sum outgoing transactions in that month belonging to the configured budget categories; income and July expenses do not contribute to this total.
- The resulting spending is Entertainment $15, Bills $150, Dining Out $133, and Personal Care $40: $338 total. Configured budget limits total $975.
- Match the budget chart and legend presentation in Figma, including the mobile legend arrangement. The center figures are derived from the demo reporting period and budget limits. Do not introduce a charting library solely for this simple Overview graphic or infer additional chart interactions.
- Store recurring-bill Overview summaries as explicitly named demo fixtures, separate from the unmodified JSON: Paid Bills $190.00; Total Upcoming $194.98; Due Soon $59.98. Do not pretend these values come from an agreed schedule, payment-status, or due-window calculation.
- No changes need to survive reload, browser restart, or navigation to a future backend. Persistence is deliberately deferred, not accidentally omitted.

### Starter cleanup

- Replace the starter app shell and home content; remove the example About page/route, unused counter store, unused Vue branding, and irrelevant starter assertions where no longer needed.
- Update generic browser metadata and relevant project instructions to describe the actual app and validation commands.
- Preserve useful routing, formatting, type-checking, linting, and test infrastructure. Removing starter examples is not permission to discard meaningful validation or broadly rewrite unrelated configuration.

## Testing Decisions

- The approved primary testing boundary is the rendered Overview assembled with app navigation. Prefer this existing screen-level interface over tests of each internal child component.
- A good test asserts user-observable content, accessible state, or interactions, not component structure, private functions, Tailwind class strings, or implementation snapshots.
- Use fast Vitest/Vue component tests for supplied summaries, all-pot inclusion and Total Saved, fixed-period budget figures, recent-transaction presentation, recurring-bill fixtures, navigation availability, and menu collapse/restore behavior.
- Apply the same public-behavior principle to the newly requested shared controls: verify button activation/disabled behavior and input labels, value updates, disabled behavior, and accessible help/error associations. These tests exercise rendered controls rather than styling internals.
- Do not use jsdom assertions as evidence that scrolling or responsive geometry actually works. Confirm those behaviors in a real browser.
- Use narrowly targeted, explicitly invoked Chromium validation at the desktop, tablet, and mobile reference sizes for layout overflow, responsive navigation, bottom-navigation clearance, and actual keyboard/touch-accessible pot scrolling. Avoid a routine three-browser matrix.
- Compare the rendered Overview with Figma for spacing, typography, colors, assets, and chart appearance. Verify intermediate and narrow widths are usable, not only the three reference dimensions.
- Run type-checking and focused tests during implementation, and run the relevant full fast suite and production build before completion. Playwright is for browser-dependent risks, not the default loop for every UI edit.
- Prior art: the repository already has Vue Test Utils and a jsdom-based Vitest setup but no meaningful source tests. Its existing Playwright test asserts obsolete starter content; replace or remove that assertion rather than preserving it as product coverage.

## Out of Scope

- Implementing the Transactions, Budgets, Pots, or Recurring Bills destination pages or their editing flows. Those views need their own supplied designs and discussion.
- Registration, login, authorization, account migration, real financial records, bank integrations, or backend implementation/API contracts.
- Persistent browser storage, offline edits that survive refresh, service workers, installability, application caching guarantees, synchronization, or conflict resolution.
- Treating ordinary static asset bundling as proof that a deployed app can reopen offline. The eventual offline requirement is deferred, not canceled or solved by this milestone.
- Real recurring-bill schedule inference, payment reconciliation, or due-soon rules.
- A broad design-system catalog, new component framework, a complete form system, or controls unrelated to the supplied designs and immediate shared button/input foundation.
- SSR, an extensive end-to-end suite, comprehensive screenshot-regression infrastructure, and unrelated refactoring.

## Further Notes

### Design references

Private design URLs are stored in `references.local.md` beside this spec. That file is Git-ignored and must be provided separately in another checkout or environment. Keep the URLs out of tracked specs, tickets, documentation, and source code.

- Desktop Overview: 1440 × 1064.
- Tablet Overview: 768 × 1923.
- Mobile Overview: 375 × 2219.

### Evidence and deliberate deviations

- The supplied assets include navigation/control SVGs, both logos, all referenced avatars, and Public Sans font files. Use these local sources; temporary Figma export URLs are not runtime assets.
- The JSON includes 49 transactions, four budgets, and five pots. It contains no explicit recurring-bill summary object or complete billing schedule.
- The owner explicitly approved $920 Total Saved, Gift at $110, scroll access to Holiday, August 2024 budget calculations, and the three recurring-bill demo fixtures. These take precedence over inconsistent screenshot numbers or a non-scrollable four-pot preview.
- No application implementation has started. This spec records the discussion and the owner's additional request to deliver shared design foundations first.
- The next planning step is an owner-reviewed breakdown into small, verifiable tickets. Publishing this spec does not authorize implementing it or generating tickets without the corresponding request/approval.
