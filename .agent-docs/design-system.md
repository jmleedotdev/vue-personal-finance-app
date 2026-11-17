# Design references and UI workflow

Applies to every feature, not only Overview. These project-wide foundations originate in `.scratch/overview/spec.md`; feature-specific behavior and approved data deviations remain in the relevant feature spec. Review conventions live in `CODING_STANDARDS.md`.

## Before implementing UI

1. Read the feature spec and inspect the relevant cached desktop, tablet, mobile, and shared-control references in `.scratch/design.local/`. Use existing exports before fetching again.
2. Inspect existing shared controls in `src/components/Base*.vue`, icon components in `src/components/icons/`, and theme definitions in `src/assets/main.css` before choosing a new control or styling approach.
3. If the needed design detail is absent from the cache, consult the private reference index at `.scratch/references.local.md` and retrieve only the relevant Figma frame or shared-control definition. Inspect the shared definition before introducing a new button/input variant. Fetch screenshots at the frame's native dimensions: when the tool accepts a maximum dimension, request at least the frame's longest edge to avoid default downscaling. Save the original fetched image without resizing or downsampling, and verify its pixel dimensions against the frame before using it for visual comparison.
4. Visually compare the rendered change with the relevant Figma references, including interaction states. Independently use focused browser checks for hover, focus, scrolling, and responsive geometry; fast rendered-app tests cover behavior rather than layout. Tests must not read or depend on the private Figma index or cache.

If private references are missing in another checkout, ask for them to be transferred separately. Identify which visual checks are blocked instead of claiming design parity from code inspection alone.

## Private-reference boundary

- Reserve `.scratch/references.local.md` for the private Figma reference index and `.scratch/design.local/` exclusively for original, native-resolution Figma screenshots. Keep metadata dumps, JSON responses, and other non-screenshot files out of the screenshot folder. These are design-reference locations, not testing inputs or output directories.
- Keep test fixtures, screenshot baselines, rendered-app captures, traces, and test reports out of both locations. Browser-test artifacts belong in the configured ignored `test-results/` or `playwright-report/` directories. Automated tests must run without access to the private Figma references.
- Tracked source, tests, specs, documentation, commit messages, and public reports may describe behavior and local reference paths, but must not reproduce private links, keys, screenshots, or reference-derived snapshots.
- Use bundled local assets at runtime. Temporary Figma export URLs and cached reference screenshots are design inputs, not application assets.
- Before staging reference-related work, verify these locations remain ignored and that no private reference artifacts entered the tracked diff.
