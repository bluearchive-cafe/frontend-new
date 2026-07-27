# News Filter Simplification Design

## Goal

Remove the non-functional category filter when there are no categories to filter, while retaining the existing category selection behavior whenever published news supplies categories.

## Decision

Use a computed `hasCategoryFilter` value derived from `newsCategories.length > 0`.

- Render the existing `v-btn-toggle` only when `hasCategoryFilter` is true.
- Keep `selectedCategory`, category counts, and filtered article behavior unchanged.
- Do not add a replacement control or alter the empty-state copy.

## Rationale

An `全部 0` control invites an action that cannot change the result. Hiding the entire filter removes this dead affordance without changing article discovery after content is published.

## Verification

Add a focused source contract test that requires the filter to be guarded by `hasCategoryFilter` and requires the computed value to depend on `newsCategories.length`.
