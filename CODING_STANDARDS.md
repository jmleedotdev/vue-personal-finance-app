# Coding standards

These design-system conventions apply to every UI implementation and review. Reviewers check the changed UI against them; feature-specific specs define behavior and approved visual deviations. Reference access and privacy workflow: `.agent-docs/design-system.md`.

## Reuse the design-system foundations

- Use existing shared controls where their semantics fit, including `BaseButton`, `BaseInput`, and `BaseSelect`. Extend a shared control with a small, design-evidenced variant when needed rather than rebuilding its appearance, focus, disabled, or keyboard behavior in a page. Keep genuinely different responsibilities separate; reuse is not a reason to create a broad component framework.
- Use the CSS-variable-backed Tailwind palette and typography presets defined in `src/assets/main.css`. Reuse existing tokens before adding a new design-evidenced token there. Equivalent hardcoded colors or one-off typography values should not create a second visual vocabulary.
- Keep Tailwind utilities alongside Vue markup as the default. Shared components may centralize variant utility strings. A component style block or named styling class needs a concrete readability or manageability justification when utilities would otherwise suffice; explain that exception during review. Global CSS remains the home for Tailwind setup, fonts, theme tokens, and baseline rules.
- Reuse local icons, fonts, logos, and avatars. Preserve supplied SVG artwork when wrapping it in a component. For single-color icons that should follow control states, prefer the existing decorative inline-SVG pattern with `currentColor` over image-filter workarounds. Confirm local assets resolve in production, not only on the development server.

## Review completion

For each changed control, verify that the shared-control choice, token usage, and any styling exception are justified. Check default, hover, current/selected, focus, and disabled states as applicable, including icon color inheritance. Identify any visual validation blocked by unavailable private references.

Native semantics, accessible names, keyboard behavior, responsive fit, and bottom-navigation clearance remain part of the component's contract; visual reuse must preserve them.
