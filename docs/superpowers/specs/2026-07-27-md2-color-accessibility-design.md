# MD2 Color Accessibility Repair Design

## Scope

Repair the audited MD2 dark-theme color defects without changing the brand palette, page structure, dependencies, or unrelated package changes.

## Chosen approach

Keep primary `#29aeea` and explicitly provide Vuetify's hyphenated `on-*` color roles. Use `#001e2d` for `on-primary`, which gives 6.81:1 contrast against the primary color. Consumers must use the generated `on-primary` role rather than hard-coded white.

Use the existing MD2 dark-theme white-overlay levels to visually separate elevated surfaces: app bars and menus use the 4dp overlay, dialogs and drawers use the 16dp overlay. Existing elevation shadows remain in place.

Remove the unused M3-only `surface-bright` theme entry so the project maintains a strict MD2 vocabulary.

## Verification

Add a focused Vitest characterization of the real Vuetify theme output. It must prove that `on-primary` is the intended dark foreground and that the M3-only token is absent. Run the test red before changing the theme, then run the focused test, typecheck, full test suite, and production build after the fix.
