# Quality and Reproducibility

## Three distinct checks

**Semantic:** the expert checks referents, direction, conditions, support, importance, and view splitting against original sources.

**Structural/geometric:** machines check IDs, references, normalized aliases, deduplication, view scope, locale completeness, positions, routes, text collisions, and versions.

**Visual/interactive:** actually inspect fonts/wrapping, sidebar, search/location, shared markers, incoming/outgoing/self/undirected focus (including reciprocal and inhibitory edges), all detail modes, camera controls, saved checkpoints, and import UI. If no browser test occurred, report it unperformed rather than labeling all three passed.

## Expert submission review

A patch records reason, importance, roleVersion, settingsVersion, and concise public identity/relation/scope notes: whether objects are the same, why the relation/direction fits, and which sources/limits apply. These are verifiable summaries, not hidden thought.

Correct source extraction does not guarantee correct interpretation. Compare the entire source-to-map crosswalk with actual paper content: important methods/contributions/results/limits need visible main anchors and intelligible branches. More edges alone does not prove richer understanding; one-to-many branches must preserve each relation's meaning. Review required vocabulary and useful topic catalogs even when the main graph is unchanged. Check hypotheses were not upgraded, refutation did not disappear, homonyms were not merged, synonymous relationships were normalized, and a complete evidence chain remains navigable after splitting. Confirm selected-language output without changing canonical semantics.

## Machine blockers

- Duplicate/missing IDs, unknown or unlocatable sources/types, invalid positions, duplicate semantic identities/edges.
- Unknown relationships, ID/label/direction disagreement, missing evidence state or required basis.
- Dangling endpoints, out-of-view endpoints, missing narrative roots, disconnected narrative paths, invalid/empty catalogs, catalog members without shared definitions/source basis, active objects invisible everywhere.
- More than four normalized predicates per tree; large trees without density review.
- Node overlap, edge labels over nodes/labels, unrelated-node crossings, stale endpoint/label/shape geometry; unknown visual roles; paths other than a single M C cubic or M L segment.
- Unjustified moves/merges/retirements, silent cascades, stale revisions/settings/roles, or cross-paper writes.
- Incomplete confirmed-language UI/status/type/predicate translations, an unconfirmed output language, or an inconsistent canonical/display-label mapping.
- Template/registry hash mismatch or noncanonical data bypassing checks before render.

Conservative width budgets do not replace actual font checks. Shorten an overlong name and retain detail in the sidebar rather than shrinking illegibly or truncating meaning.

Catalog regressions cover rootless/zero-edge and sparse disconnected views, unchanged narrative connectivity requirements, term definition/property provenance, shared lookup identities, glossary-only commits/renders, alias retention, one-to-many edges, glossary-property search, and cross-view correction display. Main concept coverage remains an expert source review; graph validity alone cannot establish that the paper is fully represented.

## Reproduction unit

Canonical snapshot + template version/hash + registry version/hash + locale text/hash + node-shape profiles/hash + layout version. The compiled template must match its maintained shell/runtime exactly. Browser-local placement overlays are intentionally outside this reproducible canonical unit. Preserve IDs, positions, routes, qualifiers, and localized labels rather than redrawing from prose each time.

The same input/version set produces byte-identical index.html, paper-state.json, and manifest. Use sorted keys, UTF-8/LF, and no current time, randomness, or machine paths in the render snapshot. Manifest hashes permit reconstruction. Fixed responsive rules do not guarantee pixel identity across different font environments.

Source rendering never silently replaces saved/imported diagram workspaces or unsaved user edits. Protect and separately review them before merging with canonical research memory; accept complete validated snapshots rather than mixing template versions.

## Persistence and failure

Plan/check before checkpoint. No material change means no map revision or rewrite. Save canonical state first, then a matching immutable artifact revision. Replace individual files atomically. If generation fails after commit, mark pending and rerender the saved revision; do not reapply the patch or invent new IDs.

Report machine results, semantic review scope, actual visual checks, and unverified parts separately. A file or passing field does not establish academic correctness.

## Regression scenarios

Aliases/reverse direction, symmetric deduplication, distinct qualifiers, missing causal basis, legal cycles, arbitrary extension, rename preserving identity, cross-tree sharing, view-only removal, merge redirects, retirement/restoration, failed-write isolation, stale revisions/roles/settings, template/registry tampering, language/preference persistence, localized labels/statuses, and byte-identical reconstruction. Also test semantic role derivation/reclassification, shape-boundary anchors, ordinary click without pointer capture, drag threshold/live rerouting/cancellation, collision rollback, explicit save/reload, Prev/Next saved checkpoints and retained former futures, full cross-paper archive import, stable v1 compatibility fixtures, independent shared-node placements, source updates, storage failure, keyboard access, and reduced motion. Check independent low/medium/high memberships, per-mode coordinates, saving all modes while low is active, and search switching to a containing mode. Check cursor-anchored zoom, background panning beyond initial bounds, scaled node dragging, signed positions saved/imported, and Center preserving content/history. Minimal-DOM tests do not establish actual touch or browser rendering quality.
