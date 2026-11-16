# Topic Catalogs for Terminology

Read for new or clarified technical vocabulary during paper-figure-explain, paper-detail-explain, paper-ask, or relevant preparation. Use [terminology teaching](../../paper-teach/references/terminology.md) for the explanation and source judgment, then maintain this reference view through the existing paper-map interface. Four public entries remain unchanged.

## Two purposes in one viewer

The main paper tree and focused argument trees have kind=narrative: a research question, substantive root, and readable connected paths. A topical vocabulary view has kind=catalog: a descriptive topic title, topicDescription, rootId=null, substantive nodeIds, and zero or a few meaningful linkIds. It is secondary; the main view remains narrative. A catalog does not need a root, a question-shaped title, a path between every pair, or a shared anchor with the main argument.

The exception is purpose-specific. Do not disable connectivity checks for narrative trees or use a catalog to hide a broken evidence chain. Empty categories are not rendered. A single useful term can start a category, which expands as the paper is taught. No fixed depth, fixed topic taxonomy, or minimum edge count applies. More than eighteen nodes requires the existing density review and often a narrower topic split; at most four canonical relation types still applies to each view.

## Select topics and memberships

Group by the reader's likely lookup task and the paper's discipline. Examples include mechanisms, genes/genomic regions, library/preparation types, mathematical objects, algorithms, measurement methods, or evaluation/statistical terms. Use clear noun titles in the saved language. Explain the category's inclusion boundary in topicDescription so later updates do not create overlapping near-duplicate categories.

Search existing categories, glossary, and node aliases before adding one. Use an existing category when its scope fits; split when the lookup purpose becomes mixed or dense. A term may appear in several catalogs and in narrative views. Reuse one global node ID and one glossary term ID for the same referent, preserving shared-count markers and sidebar links to each membership. A catalog-only term is legal and discoverable through global node search; it needs no fabricated edge into the main tree.

## Canonical content and evidence

Every canonical catalog node references at least one glossary term with a nonempty definition and traceable source basis. Keep short recognizable labels and the four semantic visual roles. A named entity is not necessarily a question; a procedure still uses method, and a general concept still uses concept. The sidebar provides the full name, original/English term, definition, role in this study, selected contextual properties, sources, and limitations.

Glossary additions use targetTerm/sourceTerm (or the existing target/original/english representation), aliases, definition, studyRole, and sourceRefs. Optional facets is an array of {label, value, sourceRefs}; sourceRefs uses registered sourceId and location. Select meaningful properties rather than forcing every term through a large generic form. Legacy sources with locator remain readable, while new facet references use location. Paper-specific findings and externally sourced background must remain distinguishable in their wording and references.

The glossary is the definition authority; node.detail supplies the study context and any necessary interpretation, not a contradictory copy. Term aliases and contextual properties participate in node search. Absent facts remain absent or explicitly qualified; a complete-looking sidebar is not a reason to invent function, localization, classification, or parameters.

## Sparse links without invented semantics

Leave terms unconnected when topic membership is all that is known or needed. Draw a link only when its exact classification, composition, prerequisite, action, or other registered meaning is useful and source-grounded. Reuse the canonical predicate and localized label; never rename the same meaning per topic. Co-occurrence in a paragraph or common membership does not justify a relation. No category node or membership line is required.

## Layout and interaction

Use the same locked viewer, shapes, palette, font rules, node search, sidebar, tree selector, and compact Layout menu. Rootless catalogs have no root highlight. Place new unconnected entries in deterministic four-column slots, starting at x=40/y=60, with 230 horizontal and 160 vertical spacing; reuse existing positions and seek the next free slot. This is an initial placement grid, not a knowledge hierarchy. Sparse edges retain shape-aware cubic/straight behavior and geometry checks.

Keep the same configured detail, tree, history/import and camera controls even in a zero-edge view. Global search locates catalog-only terms and matches glossary names/aliases, definitions, study roles, and properties. Clicking a term shows the same canonical content wherever it occurs; membership links navigate to that exact node in another view. Dragging, permanent full-map files, saved-version navigation, camera pan/zoom/Center, and reduced-motion behavior follow the [interaction contract](interaction.md).

## Update lifecycle and delivery

On each of the four entry invocations, assess new/clarified definitions and topic organization independently of whether the main research chain changed. A vocabulary-only change can justify a catalog update. Repetition can improve the existing definition; it does not force a new node, category, or edge. Record the reason and changed scope in progress.map.review, and preserve the existing entry path.

Use upsert_term for glossary additions/corrections, then add/update/attach the corresponding nodes and catalog memberships within a reviewed patch. add_tree supports kind=catalog, rootId=null, topicDescription, nodeIds, and linkIds. A patch may start an empty catalog and add its first member before final validation; an empty final view is invalid. update_tree can change kind only with an explicit reason and all resulting invariants satisfied. Retire invented links explicitly when migrating a formerly forced-connected dictionary; do not silently convert a real argument into a catalog.

Removing a term from one catalog changes only that membership. Global removal, merging, refutation, and correction still follow the node lifecycle rules. Preserve definitions and reading progress across migrations. New non-English UI keys for study role/properties require actual translations before rendering. Provide a brief update notice and reuse the stable map link.
