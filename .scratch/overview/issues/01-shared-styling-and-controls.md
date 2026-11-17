# 01: Establish shared styling and accessible controls

**What to build:** A small, reusable visual foundation for the personal-finance app, delivered before the Overview: shared Figma colors, local Public Sans typography, and accessible buttons and input fields. Controls must be independently exercisable through rendered-component tests without adding a production gallery or product forms.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Consult the parent spec and its Git-ignored private design references. Inspect the supplied design's shared button/input definitions before choosing variants; do not invent a comprehensive UI library.
- [ ] Define reusable Tailwind theme colors for the evidenced surfaces, neutrals, and accent palette, rather than repeating equivalent literals throughout templates.
- [ ] Load the supplied Public Sans font locally and retain licensing information; add no remote font or icon dependency.
- [ ] Establish the evidenced typography: 32px bold/1.2, 20px bold/1.2, 16px bold/1.5, 14px regular and bold/1.5, and 12px regular/1.5.
- [ ] Implement reusable Vue buttons with design-supported variants, native button semantics, visible keyboard focus, and correct activation and disabled behavior.
- [ ] Implement reusable Vue input fields with associated labels, value updates, disabled behavior, and accessible help/error associations.
- [ ] Use Tailwind utilities in templates by default. Limit global CSS to setup, font declarations, theme tokens, and necessary baseline rules; justify any named styling classes by clarity or manageability.
- [ ] Keep control interfaces small and grounded in the supplied designs. Do not add registration, editing forms, a validation framework, or unrelated controls.
- [ ] Test controls through their rendered public behavior: activation, non-activation when disabled, labels, value updates, and help/error associations. Do not assert private implementation details or Tailwind class strings.
- [ ] Verify design fidelity for the controls and typography; focused tests, type-checking, and the production build pass.
- [ ] Keep private design URLs out of tracked tickets, documentation, and source code.

**Scope boundary:** This establishes the shared design foundation only. It does not implement the Overview layout, a component catalog, persistence, or backend integration.
