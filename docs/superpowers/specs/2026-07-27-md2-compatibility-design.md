# MD2 Compatibility Design

## Goal

Keep the existing information architecture, including the top-level navigation Tabs, while rebuilding the visual and interaction layer around Material Design 2 rules.

## Constraints

- Keep Vue 3, Vuetify 3, Vite, TypeScript, and existing routes.
- Do not change the top-level navigation Tabs structure, labels, or navigation behavior.
- Do not downgrade to Vuetify 2.
- Keep the Blue Archive imagery and the cyan-plus-gold brand direction.
- Use semantic tokens; do not spread raw colour, elevation, or typography values through page components.
- Retain reduced-motion support and meet 48px touch-target, keyboard focus, and Escape-dismissal requirements.

## Design

### Theme and elevation

Create an MD2 compatibility token layer in `src/styles/global.css` and map the Vuetify theme in `src/theme.ts` to primary, primary variant, secondary, secondary variant, background, surface, error, and on-colours. Dark surfaces use white overlays plus MD2 shadow levels: card 1dp, contained button 2dp, app bar 4dp, menu 6dp, dialog 16dp, and drawer 24dp.

### Typography and shape

Replace fluid display tokens and custom 760/850 weights with an explicit MD2 h1-h6, subtitle, body, caption, overline, and button scale. Buttons and small controls use 4px corners; cards and dialogs use 4-8px corners.

### Components

Replace tonal variants with contained, outlined, text, and explicit chip states. Cards use elevation rather than decorative outlines as their primary hierarchy signal. Hero imagery remains but is no longer required to establish surface hierarchy.

### Accessibility

All primary controls have a 48px minimum target. Keyboard focus is visible. The temporary mobile drawer closes on Escape and restores focus to its trigger. Existing reduced-motion behavior remains intact.

## Verification

Add focused structural tests for the token contract and drawer keyboard behavior, run the complete test suite, type check, build, and visually inspect desktop plus 375px mobile views. Verify the navigation Tabs remain structurally and behaviorally unchanged.
