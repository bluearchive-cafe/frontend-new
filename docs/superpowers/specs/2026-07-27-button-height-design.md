# Button Height Adjustment Design

## Goal

Reduce the desktop and tablet action-button height from 48px to 42px while preserving a 48px minimum height on mobile screens.

## Decision

- Set the shared `--button-height` token to `42px` at the root level.
- Override `--button-height` to `48px` within the existing `max-width: 640px` media query.
- Keep font size, padding, radius, color variants, and the `.v-btn:not(.v-tab)` scope unchanged.

## Rationale

The desktop layout needs a lighter visual density. Mobile keeps the Material touch-target floor, while desktop and tablet regain the compact rhythm requested for the site.

## Verification

Update the existing button-geometry source contract test to require the 42px default and the 48px mobile override, then run the focused test and full project checks.
