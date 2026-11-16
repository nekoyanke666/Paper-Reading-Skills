# Paper-Map Data Contract

Read these focused rules when their branch applies:

- [Concept coverage](concept-coverage.md): whole-paper inventory, main overview breadth, precise branching relationships, and omission review.
- [Topic catalogs](topic-catalogs.md): rootless/unconnected vocabulary views, shared definitions, contextual properties, and update lifecycle.
- [Content model](content-model.md): substantive concepts/objects/methods/propositions and four semantic shapes.
- [Interaction](interaction.md): dragging, camera navigation, line modes, feedback, and full saved-version files.
- [Detail views](detail-views.md): three independently curated trees with shared global nodes and separate coordinates.
- [Permanent history](history-format.md): fixed v1 portable archive, base plus deltas, saved checkpoints and import.
- [Appearance](appearance.md): locked template, dimensions, persistent controls, localization, responsive checks.
- [Lifecycle](node-lifecycle.md): identity, addition, update, view removal, merge, retirement, restoration.
- [Relationships](relation-policy.md): meanings, aliases/reverses, conditions, statuses, extensions.
- [Trees/layout](tree-policy.md): questions, sharing, cycles, incremental positions/routes.
- [Quality](quality-gates.md): semantic/machine/browser checks and reproducibility.
- [Operations](operations.md): optional helpers, patches, commits, and recovery.
- [Entry/link delivery](delivery.md): default preparation, per-call review, stable paths, first links, and update notices.
- [Examples](decision-examples.md): decision boundaries and expected behavior.

Registry semantics and lock/template assets are authoritative. Expert interpretation still returns to original sources.

## Persisted data

Save graph in the canonical paper-memory session, not only the website or chat. See the explicitly fictional [theory example](../../../examples/session.example.json) and [feedback example](../../../examples/causal.example.json) for data shape, never as real findings.

- session: paper identity/title/version, revision, sources, shared glossary/claims, whole-paper model, roleProfile.version, and settings languages/preference/version.
- nodes: id; identity {kind, scope, referent}; concise label; full title/detail; detailed type; visualRole (concept, method, entity, proposition; derived from the locked typeRoles mapping when absent); aliases; sourceRefs; optional termIds, claimIds, limits, and status. Use a definite object/proposition or stable source anchor for referent, not a new paraphrase every turn.
- links: id, from/to, relationType, canonical English label, meaning, status, sourceRefs, primary, and structured qualifiers such as assumptions/population/time/aspect. Compute semanticKey. Save source wording in originalLabels; attach causalBasis/proofBasis/inferenceBasis when required.
- trees: id, kind (narrative by default for legacy views, or catalog), title, nodeIds/linkIds, positions, routes. Narrative views require focusQuestion and a substantive rootId; secondary catalogs require topicDescription and rootId=null, and may have zero links or disconnected members. The main ID is main. Views reference global content rather than copying it. Optional detailViews contains low/medium/high records, each with nodeIds/linkIds, visible narrative rootId, positions, and optional focusQuestion. Parent membership is their union; it is never displayed as an extra view. detailRoutes stores derived mode-specific routes. Positions contain finite signed x/y world coordinates (absolute values at most 10,000,000); routes contain path, label box, endpoint signature, shapeSignature, and layout version. A path is one M C cubic or one M L segment. graph.nodeShapes is the exact locked role/size/type mapping, not a per-paper redesign.
- locale: languageTag matching confirmed interactionLanguage.tag; ui, statuses, nodeTypes, and relationLabels dictionaries. English defaults come from the packaged dictionary. Other languages require complete saved translations supplied by the agent before render. Canonical IDs and labels do not change. Field names are stable English keys.
- history: retiredNodes/retiredLinks/retiredTrees preserve original item, reason, and revision; redirects/linkRedirects retain merged identity; relationExtensions define genuinely new meanings without replacing core definitions.

Glossary definitions referenced by termIds remain canonical. Names support targetTerm/sourceTerm and existing target/original/english forms; studyRole explains current use. Optional facets contain label, value, sourceRefs with traceable locations. Catalog members require defined terms and source basis; contextual properties participate in node search.

Source references contain sourceId and location identifying a registered source and locator. Clearly distinguish background, inference, user notes, and fictional examples; do not invent figure identifiers to fill fields.

The website receives a same-revision display snapshot with necessary sources, terms, settings, active graph, locale, and version hashes. Full reading memory remains in the canonical session. The frozen [history format](history-format.md) is a separate portable diagram record containing all global content, detail views, per-view positions, sources, preferences and Save history. It omits derived routes and the reading manuscript. Browser recovery cache and optional file handles are supplementary, never the only durable record. Old browser position records are read through the explicit migration adapter, not emitted as the new save format. User-created scientific notes retain provenance and pass source/identity/relation checks before merging into canonical memory. Camera offsets and scale are temporary navigation; they do not modify geometry, evidence or saved history.
