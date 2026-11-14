---
name: paper-map
description: Internal interface. Build and maintain a consistent, traceable interactive paper map when one of the four entries identifies a meaningful update. Use the locked appearance, stable node identities, canonical relation registry, explicit lifecycle, session-language localization, and quality gates.
---

# Paper Map

Input: canonical session, significant conceptual/evidential changes, and map scope. Output: an understandable interactive graph and matching saved memory, with fixed appearance and explicit verification scope. Helpers support reproducibility; source interpretation remains the saved expert's responsibility.

## 1. Decide whether an update is needed

Restore [paper-memory](../paper-memory/SKILL.md) and [paper-expert](../paper-expert/SKILL.md), including confirmed language settings, paper, integrated model, glossary, claims, graph, and revision. This interface is called by four entries, not a fifth public entry:

- paper-prepare: requested initial map, or versions/corrections affecting an existing map.
- paper-figure-explain: important concepts, interventions, results, or evidence relationships introduced by a figure.
- paper-detail-explain: changes in arguments, dependencies, proofs/mechanisms, conditions, or limitations within a complete topic.
- paper-ask: important new understanding, relationships, evidence, or corrections arising from an answer.

Judge whether the change affects prerequisites, the research thread, support, scope, or significant unknowns. If not, leave the graph unchanged. A repeated definition may improve an existing node/term; not every word or question deserves a node.

## 2. Establish content and the tree's question

Determine concepts/claims, sources, conditions, and evidence state from original material and session before drawing. A map is a view of full memory, not a replacement for understanding.

The main tree answers the core paper question, uses that question as its reading start, and takes the paper title. Name secondary trees by focused questions and reuse substantive shared nodes. Full guidance needs an integrated whole-paper model; a local answer's graph claims only local scope. Distinguish hypotheses, fictional examples, user notes, and supported findings.

For first construction read the [data contract](references/graph-contract.md). For uncertain lifecycle, relation, or splitting decisions read [decision examples](references/decision-examples.md). Every proposed item needs a definite referent, source nature, display purpose, and research question.

## 3. Preserve appearance and localize text

Read the [appearance contract](references/appearance.md). Use the [fixed template](assets/graph-viewer.html.in) and [lock](assets/template-lock.json). Replace data and the session locale, not the layout, framework, typography rules, palette, or features.

Permanent UI is limited to graph, title, node search, all-relations toggle, and a tree selector when needed. Clicking a node or relationship opens a sidebar. Nodes contain concise recognizable names; definitions, original/English terms, evidence, conditions, and limits belong in details. There is no three-level/three-column cap; arbitrary extensions and cycles are allowed.

Use the confirmed interaction language for content and the locale text dictionary. Canonical predicate IDs and English registry labels remain stable; each predicate has one saved localized display label. Missing non-English UI or relationship translations must be supplied before rendering, not silently mixed with English. A locale change may reroute labels while preserving node identity and positions. Interface redesign requires an explicit request, a new version, and visual validation.

## 4. Check identity before adding or changing nodes

Read [node lifecycle](references/node-lifecycle.md) for additions, edits, merges, removals, or restoration. Search nodes/aliases, glossary, claims, and sources first. Reuse the ID for the same referent. Equal names do not prove identity, and a new name does not create a new object.

Improve definitions, evidence, status, or names in place; preserve ID, aliases, and position. Create a new node for a materially different object or condition. Explain unchanged referent when reclassifying. Any node can extend or become a secondary-tree root. Across trees reuse the same ID, visible shared marker, sidebar link, and same-content location.

## 5. Define relationships before choosing types

Read [relation policy](references/relation-policy.md) and the [canonical registry](assets/relation-registry.json). State who relates to whom, how, and under which conditions, then select the predicate ID. Track direction, symmetry, conditions, and evidence status separately.

Synonyms normalize to one ID and canonical label. Keep source wording in originalLabels rather than inventing edge names. Support is not causality; association is not promotion; temporal order is not cause; inhibition is not uncertainty; empirical support is not formal proof; necessity is not sufficiency; composition is not classification.

Same endpoints, predicate, and qualifiers represent one edge with combined sources. Reverse aliases swap endpoints; symmetric edges deduplicate; opposite directed feedback and different conditions remain distinct. Create an x: extension only when definitions, aliases, qualifiers, and meaningful splitting cannot express the relation. Document its distinction, direction, examples, and reason without adding a new palette.

## 6. Keep focused trees and stable layout

Read [tree/layout policy](references/tree-policy.md) for secondary trees, density, or position changes. A tree focuses on one question and has at most four normalized predicate IDs. Beyond that split by question rather than relabeling everything as association. Above eighteen nodes, explicitly review density/splitting; this is not a depth or knowledge-size limit.

Retain IDs, positions, and reader context. Find local space for new content or expand the canvas rather than rearranging every update. Avoid node/label overlaps and unrelated-node crossings; endpoints and direction must be clear. All relations expands only the current tree's cross-links; shared nodes connect separate views visibly.

## 7. Remove according to intent

Changing the same referent keeps identity. Changing edge meaning, endpoints, or conditions retires the old edge and adds a new one; changes to explanation, sources, or status update it in place.

Removing from a view changes only that view; merging retains redirects and reconnects; retiring erroneous/out-of-scope graph artifacts retains content, reason, and revision. Handle roots and incident edges explicitly without silent cascades. Refuted claims remain visible with corrections and affected dependencies reviewed. Restoration uses traceable identities; merged IDs do not reappear as independent duplicates.

## 8. Save, render, and verify

Read [quality/reproducibility](references/quality-gates.md) before submission and [operations](references/operations.md) when using helpers.

1. Record importance, role/settings versions, concise public identity/relation/scope checks, and explicit incremental operations.
2. Normalize identity and relation names; check provenance, conditions, focus, geometry, locale completeness, and locked versions. Resolve failures before replacing a completed artifact.
3. Only real map changes receive a paper-memory checkpoint. No change means no map revision/rewrite.
4. Render a complete matching snapshot and manifest from canonical session, with browser drafts unable to override it.
5. Check content, label consistency, cross-tree navigation, search/location, all-relations, endpoints, and sources. Report machine checks, semantic source review, and actual visual testing separately.
6. The same canonical data and template/registry/locale/layout versions produce identical bytes, verified with hashes and immutable revisions. Responsive layouts follow fixed rules; different font environments are not guaranteed pixel-identical.

Deliver a readable, traceable, recoverable map and memory. Scripts, HTML files, and passing fields do not replace source judgment. State when real-paper or browser validation was not performed.
