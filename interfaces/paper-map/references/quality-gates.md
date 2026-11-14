# Quality and Reproducibility

## Three distinct checks

**Semantic:** the expert checks referents, direction, conditions, support, importance, and view splitting against original sources.

**Structural/geometric:** machines check IDs, references, normalized aliases, deduplication, view scope, locale completeness, positions, routes, text collisions, and versions.

**Visual/interactive:** actually inspect fonts/wrapping, sidebar, search/location, shared markers, and all-relations. If no browser test occurred, report it unperformed rather than labeling all three passed.

## Expert submission review

A patch records reason, importance, roleVersion, settingsVersion, and concise public identity/relation/scope notes: whether objects are the same, why the relation/direction fits, and which sources/limits apply. These are verifiable summaries, not hidden thought.

Correct source extraction does not guarantee correct interpretation. Check hypotheses were not upgraded, refutation did not disappear, homonyms were not merged, synonymous relationships were normalized, and a complete evidence chain remains navigable after splitting. Confirm selected-language output without changing canonical semantics.

## Machine blockers

- Duplicate/missing IDs, unknown or unlocatable sources/types, invalid positions, duplicate semantic identities/edges.
- Unknown relationships, ID/label/direction disagreement, missing evidence state or required basis.
- Dangling endpoints, out-of-view endpoints, missing roots, disconnected secondary views, active objects invisible everywhere.
- More than four normalized predicates per tree; large trees without density review.
- Node overlap, edge labels over nodes/labels, unrelated-node crossings, stale endpoint/label geometry.
- Unjustified moves/merges/retirements, silent cascades, stale revisions/settings/roles, or cross-paper writes.
- Incomplete confirmed-language UI/status/type/predicate translations, an unconfirmed output language, or an inconsistent canonical/display-label mapping.
- Template/registry hash mismatch or noncanonical data bypassing checks before render.

Conservative width budgets do not replace actual font checks. Shorten an overlong name and retain detail in the sidebar rather than shrinking illegibly or truncating meaning.

## Reproduction unit

Canonical snapshot + template version/hash + registry version/hash + locale text + layout version. Preserve IDs, positions, routes, qualifiers, and localized labels rather than redrawing from prose each time.

The same input/version set produces byte-identical index.html, paper-state.json, and manifest. Use sorted keys, UTF-8/LF, and no current time, randomness, or machine paths in the render snapshot. Manifest hashes permit reconstruction. Fixed responsive rules do not guarantee pixel identity across different font environments.

Browser drafts never override canonical state. Save notes separately for review/merge; replace with complete consistent snapshots rather than mixing template versions.

## Persistence and failure

Plan/check before checkpoint. No material change means no map revision or rewrite. Save canonical state first, then a matching immutable artifact revision. Replace individual files atomically. If generation fails after commit, mark pending and rerender the saved revision; do not reapply the patch or invent new IDs.

Report machine results, semantic review scope, actual visual checks, and unverified parts separately. A file or passing field does not establish academic correctness.

## Regression scenarios

Aliases/reverse direction, symmetric deduplication, distinct qualifiers, missing causal basis, legal cycles, arbitrary extension, rename preserving identity, cross-tree sharing, view-only removal, merge redirects, retirement/restoration, failed-write isolation, stale revisions/roles/settings, template/registry tampering, language/preference persistence, localized labels/statuses, and byte-identical reconstruction.
