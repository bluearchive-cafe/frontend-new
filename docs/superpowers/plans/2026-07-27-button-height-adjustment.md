# Button Height Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make desktop and tablet action buttons 42px high while keeping mobile action buttons at 48px.

**Architecture:** Continue using the existing global `--button-height` token so every non-tab Vuetify button remains aligned. Add the mobile value only in the existing 640px breakpoint, without changing typography, padding, colors, or navigation tabs.

**Tech Stack:** Vue 3, Vuetify, CSS custom properties, Vitest.

## Global Constraints

- Preserve the `.v-btn:not(.v-tab)` selector so navigation Tabs retain their own layout.
- Use `42px` at root and `48px` at `max-width: 640px`.
- Do not stage `package.json` or `package-lock.json`.

---

### Task 1: Tokenize compact desktop button height

**Files:**
- Modify: `tests/md2-components.test.ts`
- Modify: `src/styles/global.css`
- Test: `tests/md2-components.test.ts`

**Interfaces:**
- Consumes: `--button-height` in the global non-tab button rule.
- Produces: a 42px default token and a 48px mobile override.

- [ ] **Step 1: Write the failing test**

```ts
expect(globalStyles).toContain('--button-height: 42px')
expect(globalStyles).toContain('@media (max-width: 640px)')
expect(globalStyles).toContain('--button-height: 48px')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/md2-components.test.ts`

Expected: FAIL because the root token is currently `48px` and no mobile override exists.

- [ ] **Step 3: Write minimal implementation**

```css
:root {
  --button-height: 42px;
}

@media (max-width: 640px) {
  :root {
    --button-height: 48px;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/md2-components.test.ts`

Expected: PASS.

- [ ] **Step 5: Run regression checks**

Run: `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.

Expected: All commands exit with code 0.
