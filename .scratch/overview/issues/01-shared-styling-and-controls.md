# 01: Establish shared styling and accessible controls

**What to build:** A small, reusable visual foundation for the personal-finance app, delivered before the Overview: shared Figma colors, local Public Sans typography, and accessible buttons and input fields. Controls must be independently exercisable through rendered-component tests without adding a production gallery or product forms.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] Consult the parent spec and its Git-ignored private design references. Inspect the supplied design's shared button/input definitions before choosing variants; do not invent a comprehensive UI library.
- [x] Define reusable Tailwind theme colors for the evidenced surfaces, neutrals, and accent palette, rather than repeating equivalent literals throughout templates.
- [x] Load the supplied Public Sans font locally and retain licensing information; add no remote font or icon dependency.
- [x] Establish the evidenced typography: 32px bold/1.2, 20px bold/1.2, 16px bold/1.5, 14px regular and bold/1.5, and 12px regular/1.5.
- [x] Implement reusable Vue buttons with design-supported variants, native button semantics, visible keyboard focus, and correct activation and disabled behavior.
- [x] Implement reusable Vue input fields with associated labels, value updates, disabled behavior, and accessible help/error associations.
- [x] Owner-approved extension: add a custom accessible dropdown field matching the supplied closed category field and dropdown list. Support labeled string options, `v-model`, a placeholder, disabled/help/error states, mouse selection, keyboard navigation/typeahead, dismissal, and focus management. Keep it separate from the text input and do not add a product form.
- [x] Use Tailwind utilities in templates by default. Limit global CSS to setup, font declarations, theme tokens, and necessary baseline rules; justify any named styling classes by clarity or manageability.
- [x] Keep control interfaces small and grounded in the supplied designs. Do not add registration, editing forms, a validation framework, or unrelated controls.
- [x] Test controls through their rendered public behavior: activation, non-activation when disabled, labels, value updates, and help/error associations. Do not assert private implementation details or Tailwind class strings.
- [x] Verify design fidelity for the controls and typography; focused tests, type-checking, and the production build pass.
- [x] Keep private design URLs out of tracked tickets, documentation, and source code.

**Scope boundary:** This establishes the shared design foundation only. It does not implement the Overview layout, a component catalog, persistence, or backend integration.

## Comments

### Implementation — reviewed and approved

- Added local Public Sans font declarations (existing OFL retained), shared Tailwind colors overriding `gray`, and typography presets. Use `text-preset-4 font-bold` for the bold 14px preset.
- Added `BaseButton` with the four evidenced variants and optional decorative trailing caret, and `BaseInput` with labels, `v-model`, disabled state, help/error associations, and native input attribute forwarding. Props use destructured defaults as requested.
- Initially kept the field interface to the basic text field; the owner subsequently approved the separate custom dropdown described below. No production gallery or product forms added.
- Verified rendered dimensions, typography, local font loading, native Enter/Space activation, focus visibility, hover/error precedence, and narrow-width rendering using a temporary browser fixture, removed afterward.
- Validation: all 8 unit tests pass; type-check, focused ESLint, formatting, and production build pass.
- Two-axis review: Standards found no issues; Spec found two state-styling issues (input focus/error precedence and destroy hover composition), both corrected and browser-verified.
- Existing E2E limitation: Chromium reaches the app but fails the stale `You did it!` heading assertion in `e2e/vue.spec.ts`; current `HomeView.vue` has no such heading. Firefox and WebKit browser executables are not installed. Left the out-of-scope starter test unchanged.
- Changes were held uncommitted during owner review. The owner has now reviewed and explicitly approved committing.

### Owner-approved dropdown extension

- Added `BaseSelect` as a custom select-only combobox and listbox, matching the supplied dropdown panel (white, rounded, shadow, separators, selected label bold) and closed field (local caret, shared colors and dimensions).
- The owner explicitly chose a custom dropdown over the initially proposed native select after supplying closed/open design references. Keep those links only in the ignored private reference file.
- Interface: labeled string options, `v-model`, optional placeholder, disabled state, help and error text. No multi-select, search field, validation framework, dependency, or product form.
- Keyboard support follows the select-only combobox pattern: DOM focus stays on the trigger, active option is exposed with `aria-activedescendant`, arrows/Home/End navigate, typing finds labels, Enter/Space/Tab commit, Escape cancels. Outside pointer interaction or focus leaving dismisses; active options scroll into view.
- Added the dropdown and its disabled/error/placeholder examples to the Git-ignored local review page. Its local stylesheet explicitly scans the ignored preview so layout and typography utilities render correctly.
- Final validation: all 18 unit tests pass, including dropdown option-reordering/removal and multiword-typeahead regressions. Type-check, focused ESLint, formatting, and production build pass. Browser checks cover keyboard and pointer selection/dismissal, typeahead, focus, disabled/error states, active-option scrolling, loaded caret geometry, a 45px empty/default field, and no horizontal overflow at 375px.
- Follow-up review: Standards found no issues; Spec found three edge cases (reactive option changes, spaces in multiword typeahead, and empty-field height), all corrected. Regression checks were observed failing before the fixes and passing afterward; the reviewer re-read the fixes and regression coverage and cleared all three findings with no remaining issues.
- No new E2E infrastructure was added; the previously documented stale starter assertion and missing Firefox/WebKit executables remain outside this ticket. The local review preview remains Git-ignored, available for owner review, and excluded from production.

### Owner review completed

- Applied requested dropdown list top/bottom padding (12px), beige option hover backgrounds, and 150ms button color transitions with reduced-motion support.
- Owner reviewed and authorized committing the completed work.
- Final checks: all 18 unit tests, type-check, focused ESLint, production build, and diff whitespace validation pass. Known starter E2E limitations remain as documented above.
