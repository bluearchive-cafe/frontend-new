# Vuetify 4 Visual Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the project’s existing Material Design 2 menu and App Bar elevation after the Vuetify 4 upgrade.

**Architecture:** Keep the project’s semantic MD2 tokens as the source of truth and move only the affected overrides to Vuetify 4’s actual component structure. Protect the behavior with source-level contracts, then verify the computed rendering through the production preview.

**Tech Stack:** Vue 3, Vuetify 4, TypeScript, CSS, Vitest, Vite, Browser

## Global Constraints

- Preserve the existing Material Design 2 dark theme, including the frosted App Bar.
- Do not add global heading, paragraph, or list resets.
- Do not change theme colors, button sizing, cards, dialogs, navigation behavior, or responsive breakpoints.
- Use Node.js `>=24.11.0 <25`.
- Do not modify files under `.worktrees/`.

---

### Task 1: Align the visual compatibility contracts with Vuetify 4

**Files:**
- Modify: `tests/md2-components.test.ts`
- Modify: `src/styles/global.css`
- Modify: `src/components/AppHeader.vue`

**Interfaces:**
- Consumes: `--md2-surface-overlay-04`, `--md2-elevation-menu`, and `--md2-elevation-app-bar` from `src/styles/global.css`.
- Produces: a single shadow-bearing menu surface at `.v-menu > .v-overlay__content > .v-list` and an explicit App Bar override at `.app-header.v-app-bar.v-toolbar`.

- [ ] **Step 1: Write the failing selector contracts**

Add these expectations to `tests/md2-components.test.ts`:

```ts
it('targets the Vuetify 4 App Bar root when applying Material 2 elevation', () => {
  expect(appHeaderSource).toContain('.app-header.v-app-bar.v-toolbar {')
  expect(appHeaderSource).toContain('box-shadow: var(--md2-elevation-app-bar)')
})

it('keeps the Vuetify 4 menu shadow on one surface layer', () => {
  expect(globalStyles).toContain('.v-menu > .v-overlay__content {\n  box-shadow: none;\n}')
  expect(globalStyles).toContain('.v-menu > .v-overlay__content > .v-list {')
  expect(globalStyles).toContain('background-image: linear-gradient(var(--md2-surface-overlay-04), var(--md2-surface-overlay-04)) !important;')
  expect(globalStyles).toContain('box-shadow: var(--md2-elevation-menu);')
  expect(globalStyles).not.toContain('.v-menu > .v-overlay__content,\n.v-menu .v-list')
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npx vitest run tests/md2-components.test.ts
```

Expected: FAIL because the App Bar still uses `.app-header`, the menu overlay does not set `box-shadow: none`, and the menu list still uses the legacy descendant selector.

- [ ] **Step 3: Apply the minimal Vuetify 4 selector changes**

In `src/components/AppHeader.vue`, change:

```css
.app-header {
```

to:

```css
.app-header.v-app-bar.v-toolbar {
```

In `src/styles/global.css`, replace the shared App Bar/menu overlay rule:

```css
.v-app-bar,
.v-menu .v-list {
  background-image: linear-gradient(var(--md2-surface-overlay-04), var(--md2-surface-overlay-04)) !important;
}
```

with:

```css
.v-app-bar {
  background-image: linear-gradient(var(--md2-surface-overlay-04), var(--md2-surface-overlay-04)) !important;
}
```

Replace the legacy menu shadow rule:

```css
.v-menu > .v-overlay__content,
.v-menu .v-list {
  box-shadow: var(--md2-elevation-menu);
}
```

with:

```css
.v-menu > .v-overlay__content {
  box-shadow: none;
}

.v-menu > .v-overlay__content > .v-list {
  background-image: linear-gradient(var(--md2-surface-overlay-04), var(--md2-surface-overlay-04)) !important;
  box-shadow: var(--md2-elevation-menu);
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
npx vitest run tests/md2-components.test.ts
```

Expected: all tests in `tests/md2-components.test.ts` pass.

- [ ] **Step 5: Review the production diff**

Run:

```powershell
git diff -- tests/md2-components.test.ts src/styles/global.css src/components/AppHeader.vue
git diff --check
```

Expected: only the selector contracts and the two scoped compatibility changes appear; no whitespace errors.

---

### Task 2: Verify the production rendering and full application contract

**Files:**
- Verify: `src/pages/DownloadPage.vue`
- Verify: `src/components/AppHeader.vue`
- Verify: existing tests and production build

**Interfaces:**
- Consumes: the production output created by `npm run build`.
- Produces: browser evidence for the desktop download menu, desktop App Bar, and mobile navigation drawer.

- [ ] **Step 1: Run the complete automated gates**

Run:

```powershell
npm run audit
npm test -- --exclude ".worktrees/**"
npm run typecheck
npm run build
git diff --check
```

Expected: audit reports zero vulnerabilities; 21 main-checkout test files and 70 or more tests pass; type checking and build exit successfully; the diff has no whitespace errors.

- [ ] **Step 2: Start the production preview**

Run:

```powershell
npm run preview -- --port 4173
```

Expected: Vite serves the current production build at `http://127.0.0.1:4173/`.

- [ ] **Step 3: Verify the desktop download menu**

At a desktop viewport:

1. Open `http://127.0.0.1:4173/download`.
2. Confirm the title and meaningful page content render without a framework error overlay.
3. Open the first visible “查看下载选项” button.
4. Confirm the menu list is visible and has one visual shadow boundary.
5. Read computed styles:
   - `.v-menu > .v-overlay__content` has `box-shadow: none`.
   - `.v-menu > .v-overlay__content > .v-list` has a non-`none` `box-shadow`.
   - `.v-menu > .v-overlay__content > .v-list` has the MD2 elevation overlay background image.
6. Confirm the App Bar retains its translucent background, blur, and non-`none` shadow.
7. Confirm the console contains no relevant application errors or warnings.

- [ ] **Step 4: Verify the mobile App Bar and Drawer**

At a 360px-wide viewport:

1. Open `http://127.0.0.1:4173/`.
2. Confirm the menu icon is visible and its interactive bounds are at least 48px square.
3. Open the Drawer and confirm its navigation list renders without clipping.
4. Press Escape and confirm the Drawer closes and focus returns to the menu icon.
5. Confirm there is no horizontal overflow or framework error overlay.

- [ ] **Step 5: Stop the preview and commit the repair**

Stop only the preview process created in Step 2, then run:

```powershell
git add tests/md2-components.test.ts src/styles/global.css src/components/AppHeader.vue
git commit -m "fix(ui): 适配 Vuetify 4 表面层级"
```

Expected: one focused Conventional Commit containing the visual repair and its regression contracts.

