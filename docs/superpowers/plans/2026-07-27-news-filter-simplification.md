# News Filter Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the news category filter when the page has no available categories.

**Architecture:** Keep the filtering model unchanged and introduce one derived visibility flag in `NewsPage.vue`. The template consumes that flag to avoid rendering a zero-result filter; a focused test protects the contract.

**Tech Stack:** Vue 3, TypeScript, Vuetify, Vitest.

## Global Constraints

- Preserve all existing category selection and filtering behavior when categories exist.
- Do not change main navigation Tabs, article data, or empty-state copy.
- Keep the MD2 button treatment unchanged.

---

### Task 1: Conditionally render the news category filter

**Files:**
- Create: `tests/news-filter.test.ts`
- Modify: `src/pages/NewsPage.vue:10-27,84-87`
- Test: `tests/news-filter.test.ts`

**Interfaces:**
- Consumes: `newsCategories` imported by `src/pages/NewsPage.vue`.
- Produces: `hasCategoryFilter`, a `ComputedRef<boolean>` that controls filter visibility.

- [x] **Step 1: Write the failing test**

`expect(source).toContain('v-if="hasCategoryFilter"')`

`expect(source).toContain('const hasCategoryFilter = computed(() => newsCategories.length > 0)')`

- [x] **Step 2: Run test to verify it fails**

Run `npm test -- tests/news-filter.test.ts`.

Expected: FAIL because `NewsPage.vue` always renders the filter and has no visibility computed value.

- [x] **Step 3: Write minimal implementation**

Add `v-if="hasCategoryFilter"` to the existing `v-btn-toggle`, and define `const hasCategoryFilter = computed(() => newsCategories.length > 0)` beside `categoryOptions`.

- [x] **Step 4: Run test to verify it passes**

Run `npm test -- tests/news-filter.test.ts`.

Expected: PASS.

- [x] **Step 5: Run regression checks**

Run `npm test` and `npm run typecheck`.

Expected: all tests and type checks pass.

- [ ] **Step 6: Commit**

Run `git add src/pages/NewsPage.vue tests/news-filter.test.ts docs/superpowers/specs/2026-07-27-news-filter-simplification-design.md docs/superpowers/plans/2026-07-27-news-filter-simplification.md` followed by `git commit -m "fix(news): 隐藏空分类筛选"`.
