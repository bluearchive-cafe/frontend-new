# Dependency Compatibility Upgrade Implementation Plan

> **For agentic workers:** Execute each task with dependency resolution and full verification.

**Goal:** Produce one lockfile with the newest compatible direct dependencies.

**Architecture:** Treat Vite, Vue Router, and the Vue compiler plugin as one peer-dependency unit. Keep TypeScript below the incompatible major release.

**Tech Stack:** npm, Node 22, Vue 3, Vite, Vuetify, Vitest, vue-tsc.

## Global Constraints

- Use Node 22.18.0 or newer, below Node 23.
- Do not use `--force` or `--legacy-peer-deps`.
- TypeScript must remain in the 6.0 release line until vue-tsc supports TypeScript 7.

---

### Task 1: Generate a compatible dependency lockfile

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Set every direct dependency to the latest compatible release.
- [ ] Generate the lockfile using npm with Node 22.
- [ ] Verify `npm ci` succeeds without peer-dependency overrides.

### Task 2: Verify the full application contract

**Files:**
- Test: existing Vitest suites

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
