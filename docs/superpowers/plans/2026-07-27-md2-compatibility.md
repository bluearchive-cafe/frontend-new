# MD2 Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site's visual and interaction layer around Material Design 2 while preserving its routes and top-level navigation Tabs.

**Architecture:** Introduce a semantic MD2 token layer, then migrate shared primitives before page-level components. Keep Vuetify 3 as the renderer, but neutralize MD3-oriented visual variants through project styles and component props.

**Tech Stack:** Vue 3, TypeScript, Vuetify 3, Vite, Vitest, Sass/CSS.

## Global Constraints

- Preserve `AppHeader` top-level Tabs structure, labels, and route behavior.
- Keep Blue Archive imagery and cyan-plus-gold brand recognition.
- Do not add dependencies or downgrade Vuetify.
- Use 48px interactive targets and respect `prefers-reduced-motion`.
- Run `npm test`, `npm run typecheck`, and `npm run build` before handoff.

---

### Task 1: Define MD2 semantic theme tokens

**Files:**
- Modify: `src/theme.ts`
- Modify: `src/styles/global.css`
- Test: `src/theme.test.ts`

- [ ] Write a failing test asserting the exported theme includes the MD2 palette roles and the CSS source contains MD2 elevation tokens.
- [ ] Run `npm test -- src/theme.test.ts` and confirm the test fails because the palette roles do not exist.
- [ ] Add primary/secondary variants, on-colours, dark elevation overlays, shadow levels, fixed typography tokens, and MD2 shape tokens.
- [ ] Run `npm test -- src/theme.test.ts` and confirm it passes.

### Task 2: Migrate shared application chrome

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/AppHeader.vue`
- Modify: `src/components/SiteFooter.vue`
- Test: `src/components/AppHeader.test.ts`

- [ ] Write a failing test for Escape dismissal and focus restoration of the mobile drawer without asserting any changed Tabs markup.
- [ ] Run `npm test -- src/components/AppHeader.test.ts` and confirm it fails.
- [ ] Apply MD2 App Bar, drawer elevation, focus, and 48px target styles while leaving the Tabs structure unchanged.
- [ ] Run `npm test -- src/components/AppHeader.test.ts` and confirm it passes.

### Task 3: Migrate common content primitives

**Files:**
- Modify: `src/components/PageHeading.vue`
- Modify: `src/components/HeroSection.vue`
- Modify: `src/components/NewsSection.vue`
- Modify: `src/components/CategoryBadge.vue`
- Modify: `src/components/DraftBadge.vue`
- Modify: `src/components/PinnedBadge.vue`
- Test: `src/components/PageHeading.test.ts`

- [ ] Write failing structural tests for fixed MD2 typography and non-tonal chip classes.
- [ ] Run the focused tests and confirm failure.
- [ ] Replace fluid typography, decorative surface hierarchy, and pill-only badge styling with MD2 primitives.
- [ ] Run focused tests and confirm success.

### Task 4: Migrate route-level surfaces and actions

**Files:**
- Modify: `src/pages/DownloadPage.vue`
- Modify: `src/pages/NewsPage.vue`
- Modify: `src/pages/StatusPage.vue`
- Modify: `src/components/AboutSection.vue`
- Test: `src/pages/DownloadPage.test.ts`

- [ ] Write failing tests that reject tonal variants and assert M2 button, card, dialog, and loading contracts.
- [ ] Run focused tests and confirm failure.
- [ ] Replace tonal variants, zero-elevation cards, and gradient-led hierarchy with MD2 component treatments.
- [ ] Run focused tests and confirm success.

### Task 5: Verify responsive and production behavior

**Files:**
- Modify: tests created in Tasks 1-4 only when verification reveals a missing contract.

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Inspect desktop and 375px mobile renderings, confirming unchanged Tabs and MD2 elevation, component, and accessibility behavior.
