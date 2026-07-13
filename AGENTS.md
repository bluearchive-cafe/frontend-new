# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vue 3, TypeScript, Vuetify, and Vite single-page site. Application startup and routing live in `src/main.ts`, `src/App.vue`, and `src/router.ts`. Put route-level views in `src/pages/`, reusable UI in `src/components/`, shared browser logic in `src/utils/`, and theme or global styling in `src/theme.ts` and `src/styles/`. News metadata and Markdown articles belong under `src/content/`. Static files served unchanged are in `public/`; build and content-generation utilities are in `scripts/`. Tests sit beside TypeScript modules or their related script, using `*.test.ts` and `*.test.mjs`.

## Build, Test, and Development Commands

Use Node.js 22, matching GitHub Actions, and install locked dependencies with `npm ci`.

- `npm run dev`: optimize hero images, then start Vite on `127.0.0.1`.
- `npm test`: run the Vitest suite once.
- `npm run typecheck`: run strict Vue and TypeScript checks without emitting files.
- `npm run build`: optimize assets, type-check, build `dist/`, prune originals, and generate Pages fallbacks and the sitemap.
- `npm run preview`: serve the production build locally.

Run `npm test` and `npm run build` before submitting changes.

## Coding Style & Naming Conventions

Follow the existing two-space indentation, single quotes in TypeScript, and no-semicolon style. Use `PascalCase.vue` for components and pages, kebab-case for utility and script filenames, and camelCase for TypeScript symbols. Keep Vue components in `<template>`, `<script setup lang="ts">`, then `<style scoped>` order. TypeScript is strict and rejects unused locals, unused parameters, and fallthrough switch cases. No standalone formatter or linter is configured, so preserve the surrounding file's formatting exactly.

## Testing Guidelines

Vitest is the test framework; DOM-dependent tests declare the `jsdom` environment. Add focused tests beside changed utilities and scripts. Name suites after the exported behavior and write assertions for valid input, invalid input, and state cleanup where applicable. There is no configured coverage threshold.

## Commit & Pull Request Guidelines

Use Conventional Commits, as shown in history: `feat: 添加下载方式`, `fix(seo): 完善 Organization JSON-LD`. Keep each commit focused; descriptions and bodies may be Chinese. Pull requests must explain the behavioral change, list verification commands, link related issues, and include screenshots for visible UI changes.

## Agent-Specific Instructions

Never infer identifier spelling, key casing, paths, field structure, or configuration. Read the relevant source, tests, logs, or captured data first. If the exact value is absent, ask the maintainer to obtain it before editing.
