# Dependency Compatibility Upgrade Design

## Goal

Update every direct dependency to the newest version that can coexist with the project's Vue, Vite, Vuetify, and type-checking toolchain.

## Decision

Upgrade the Vite/Vue toolchain as a single unit: Vite 8, Vue Router 5, `@vitejs/plugin-vue` 6, Vue 3.5, Vuetify 4, and their current compatible peers. Update all other direct dependencies reported by `npm-check-updates`.

Keep TypeScript on the current 6.0 release line. TypeScript 7 makes `vue-tsc 3.3.8` fail at runtime because `typescript/lib/tsc` is no longer exported; no newer `vue-tsc` release is available to restore compatibility.

## Validation

Use Node 22, clean-install the generated lockfile, then run tests, type checking, production build, and whitespace validation. Do not use peer-dependency bypass flags.
