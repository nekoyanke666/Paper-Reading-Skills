---
name: paper-map
description: Internal interface. Prepare a stable map entry by default during paper-prepare, deliver its first usable link, and maintain the tree when a paper-content entry identifies meaningful changes or explicitly requests a new topic tree. Preserve locked appearance, canonical identities/relations, localization, lifecycle, and quality gates.
---

# Paper Map

**The user's time is valuable.** Minimize unnecessary waiting: reuse valid work, load only relevant material, and avoid redundant steps while preserving the requested completeness, evidence checks and saved-state safety.

Input: canonical session, significant conceptual/evidential changes, and map scope. Output: an expert-structured knowledge/relationship graph with independently understandable node explanations and matching saved memory, fixed appearance and explicit verification scope. Helpers support reproducibility; source interpretation and conceptual organization remain the saved expert's responsibility.

## 1. Restore the entry and evaluate changes

For an existing-map open/reopen request, follow [open the entry](references/open-entry.md): resolve its saved workspace-relative location, check/restart its local service, and present the verified URL through the host's browser panel when supported. This navigation-only case preserves scientific data and reading progress; no manual launcher is required from the reader when the agent can execute locally.

Restore [paper-memory](../paper-memory/SKILL.md) and [paper-expert](../paper-expert/SKILL.md), including confirmed language settings, paper, integrated model, glossary, claims, graph, and revision. Five paper-content entries use this interface; paper-skill-help describes capabilities without invoking map changes:

- paper-prepare: always prepare or restore the stable map entry, then assess important content, versions, and corrections.
- paper-figure-explain: important concepts, interventions, results, or evidence relationships introduced by a figure.
- paper-detail-explain: changes in arguments, dependencies, proofs/mechanisms, conditions, or limitations within a complete topic.
- paper-ask: important new understanding, relationships, evidence, or corrections arising from an answer.
- paper-add-map: an explicitly requested new topic tree in the existing entry, with a separate integration decision; follow [requested trees](references/tree-requests.md).

Every invocation of a paper-content entry evaluates changes, including continuations and narrow requests. Judge whether this work affects prerequisites, the research thread, support, scope, or significant unknowns. Save the decision and its short reason in progress.map.review. If no meaningful change is needed, retain the graph without a map revision or rewrite. A repeated definition may improve an existing node/term; not every word or question deserves a node. Necessary reusable technical vocabulary can justify a topical catalog update even when no principal finding changes. Assess main-argument coverage and terminology retention separately rather than treating a vocabulary-only update as no change.

Read [local storage](references/local-storage.md) when allocating, starting, moving or upgrading an entry: reserve a per-paper space relative to its current workspace, reuse it across conversations, and provide a checked local-service URL. Ordinary Save writes to that entry's history folder; only Back up elsewhere asks for a destination.

During preparation, create or restore the entry as soon as the paper and output language are confirmed; do not wait for a separate map request, the full translation, or the first teaching session. Use a minimal source-backed root when evidence is incomplete, mark provisional scope, and leave unsupported relationships absent. If the core question is not yet known, the root may identify the paper until an evidence-based research root can replace it under lifecycle rules. Full-paper readiness is not required for this honest initial entry. A direct first use of another public entry repairs a missing entry in the same way.

Persist the entry's stable workspace-relative path under progress.map.entryPath. Reuse it across this paper's views and conversations. Read [entry and link delivery](references/delivery.md) when creating/restoring the entry, finishing an update, or responding in a conversation that has not received its link.

## 2. Establish content and the tree's question

Determine concepts/claims, sources, conditions, and evidence state from original material and the verified model before drawing. Organize as the paper-appropriate domain expert: establish what knowledge this tree represents, which substantive objects and distinctions matter, and how their actual relationships explain the subject. Use the [expert content model](references/content-model.md) before selecting branches. Conversation order, old examples and figure-warning notes do not define the tree's structure. A map is a view of full understanding, not a transcript or a replacement for it.

The main tree answers the core paper question, uses that question as its reading start, and takes the paper title. Name secondary narrative trees by focused questions and reuse substantive shared nodes when genuine overlap exists. An explicitly independent narrative without such an anchor uses the documented standalone reason; do not fabricate overlap. Name topic catalogs by their lookup subject; they can contain independent glossary-bound terms. Full guidance needs an integrated whole-paper model; a local answer's graph claims only local scope. Distinguish hypotheses, fictional examples, user notes, and supported findings.

For first construction or a completeness/richer-relationship review, read [concept and relationship coverage](references/concept-coverage.md) and build the source-to-map crosswalk. The main view must expose the entire research architecture with substantive anchors for its important contributions, methods, results, and limits. One-to-many, many-to-one, and feedback connections are allowed; each edge retains its own meaning and basis.

For first construction read the [content model](references/content-model.md): identify the actual objects, necessary concepts, procedures, and propositions rather than making every node a question. Explicitly identify the alternatives in comparison/discrimination questions. Assign one of four semantic visual roles without changing scientific identity. Read the [data contract](references/graph-contract.md). For uncertain lifecycle, relation, or splitting decisions read [decision examples](references/decision-examples.md). Every proposed item needs a definite referent, source nature, and display purpose in the research argument or terminology lookup. For reusable vocabulary or category organization, read [topic catalogs](references/topic-catalogs.md): secondary catalog views can be rootless and unconnected, with definitions and properties in the shared glossary. Topic titles describe the lookup category rather than inventing a question or category-root node.

## 3. Preserve appearance and localize text

Read [Markdown and mathematical text](references/rich-text.md) when authoring or upgrading formatted explanations. Sidebars render Markdown and LaTeX math from the original stored strings; graph labels stay concise literal text. Preserve raw source in the fixed history format and use the bundled offline renderer/fonts rather than external equation services or HTML pasted into the model.

Read the [appearance contract](references/appearance.md). Use the [fixed template](assets/graph-viewer.html.in) and [lock](assets/template-lock.json). Replace data and the session locale, not the layout, framework, typography rules, palette, or features.

The fixed surface contains the title, global node search, an always-present tree selector, Low/Medium/High controls, a compact Save & history menu, and compact zoom/Center controls. Read [direct manipulation](references/interaction.md) for the viewport-filling background, independent camera and node dragging, curves/straight lines, feedback, keyboard access, and permanent saving. Read [detail views](references/detail-views.md) when creating or revising the three independently curated trees; they share global node definitions, not mandatory subsets or automatic path shortcuts. Read [permanent history](references/history-format.md) for full portable files, Save checkpoints, Prev/Next, and import compatibility. Browser content remains separate from canonical research memory until reviewed. Clicking a node or relationship opens a sidebar. Read [direction focus](references/direction-focus.md) whenever generating or checking selection: incident edges distinguish incoming, outgoing, self and undirected connections with endpoint markers and grouped source-to-target text; unrelated content fades without changing the scientific graph. Nodes contain concise recognizable names; definitions, original/English terms, evidence, conditions, and limits belong in details. There is no three-level/three-column cap; arbitrary extensions and cycles are allowed.

Use the confirmed interaction language for content and the locale text dictionary. Canonical predicate IDs and English registry labels remain stable; each predicate has one saved localized display label. Missing non-English UI or relationship translations must be supplied before rendering, not silently mixed with English. A locale change may reroute labels while preserving node identity and positions. Interface redesign requires an explicit request, a new version, and visual validation.

## 4. Check identity before adding or changing nodes

For every new or revised node, read [complete node explanations](references/node-explanations.md). Its sidebar must explain the actual referent, relevant process/properties or reasoning, and role in the study for a non-specialist entering directly from search. Do not substitute an old example, extracted answer fragment, unresolved "as mentioned earlier" pointer, or a warning about what something in a figure is not. Source locators and scientifically relevant scope accompany the substantive account. Repair inadequate same-referent details when encountered; unchanged graph topology does not make that repair a no-change review.

Read [node lifecycle](references/node-lifecycle.md) for additions, edits, merges, removals, or restoration. Search nodes/aliases, glossary, claims, and sources first. Reuse the ID for the same referent. Equal names do not prove identity, and a new name does not create a new object.

Improve definitions, evidence, status, or names in place; preserve ID, aliases, and position. Create a new node for a materially different object or condition. Explain unchanged referent when reclassifying. Any node can extend or become a secondary-tree root. Across trees reuse the same ID, visible shared marker, sidebar link, and same-content location.

## 5. Define relationships before choosing types

Read [relation policy](references/relation-policy.md) and the [canonical registry](assets/relation-registry.json). State who relates to whom, how, and under which conditions, then select the predicate ID. Track direction, symmetry, conditions, and evidence status separately.

Synonyms normalize to one ID and canonical label. Keep source wording in originalLabels rather than inventing edge names. Support is not causality; association is not promotion; temporal order is not cause; inhibition is not uncertainty; empirical support is not formal proof; necessity is not sufficiency; composition is not classification.

Same endpoints, predicate, and qualifiers represent one edge with combined sources. Reverse aliases swap endpoints; symmetric edges deduplicate; opposite directed feedback and different conditions remain distinct. Create an x: extension only when definitions, aliases, qualifiers, and meaningful splitting cannot express the relation. Document its distinction, direction, examples, and reason without adding a new palette.

## 6. Keep focused trees and stable layout

Read [tree/layout policy](references/tree-policy.md) for secondary trees, density, or position changes. A narrative tree focuses on one question; a catalog focuses on a defined lookup topic and may have zero edges. Each view has at most four normalized predicate IDs. Beyond that split by question rather than relabeling everything as association. Above eighteen nodes, explicitly review density/splitting; this is not a cap, target node count, depth limit, or knowledge-size limit. Do not omit important parts of the paper to keep the main tree small.

Retain IDs, positions, and reader context. A node inspection temporarily centers its target; closing it restores the captured browsing position and zoom under the [interaction contract](references/interaction.md), rather than centering the whole tree. Find local space for new content or expand the canvas rather than rearranging every update. Avoid node/label overlaps and unrelated-node crossings; endpoints and direction must be clear. Each detail tree displays its own reviewed relationships; shared-node memberships connect topics and detail modes visibly. Use higher detail to make genuinely useful distinctions explicit while keeping labels concise and definitions complete.

## 7. Remove according to intent

Changing the same referent keeps identity. Changing edge meaning, endpoints, or conditions retires the old edge and adds a new one; changes to explanation, sources, or status update it in place.

Removing from a view changes only that view; merging retains redirects and reconnects; retiring erroneous/out-of-scope graph artifacts retains content, reason, and revision. Handle roots and incident edges explicitly without silent cascades. Refuted claims remain visible with corrections and affected dependencies reviewed. Restoration uses traceable identities; merged IDs do not reappear as independent duplicates.

## 8. Save, render, and verify

Read [quality/reproducibility](references/quality-gates.md) before submission and [operations](references/operations.md) when using helpers.

1. Record importance, role/settings versions, concise public identity/relation/scope checks, and explicit incremental operations.
2. Normalize identity and relation names; check provenance, conditions, focus, geometry, locale completeness, and locked versions. Resolve failures before replacing a completed artifact.
3. Only real map changes receive a paper-memory checkpoint. No change means no map revision/rewrite.
4. Render a complete matching snapshot and manifest from canonical session, with protected saved/imported workspaces and unsaved drafts kept separate from source updates.
5. Check content, label consistency, cross-tree navigation, search/location, all three detail trees, camera movement/zoom/Center, full file history/import, endpoints, and sources. Report machine checks, semantic source review, and actual visual testing separately.
6. The same canonical data and template/registry/locale/layout versions produce identical bytes, verified with hashes and immutable revisions. Responsive layouts follow fixed rules; different font environments are not guaranteed pixel-identical.

Deliver a readable, traceable, recoverable map and memory. Scripts, HTML files, and passing fields do not replace source judgment. State when real-paper or browser validation was not performed.
