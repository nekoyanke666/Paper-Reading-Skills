# Paper-Map Data Contract

Read these focused rules when their branch applies:

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
- nodes: id; identity {kind, scope, referent}; concise label; full title/detail; type; aliases; sourceRefs; optional termIds, claimIds, limits, and status. Use a definite object/proposition or stable source anchor for referent, not a new paraphrase every turn.
- links: id, from/to, relationType, canonical English label, meaning, status, sourceRefs, primary, and structured qualifiers such as assumptions/population/time/aspect. Compute semanticKey. Save source wording in originalLabels; attach causalBasis/proofBasis/inferenceBasis when required.
- trees: id, title, focusQuestion, rootId, nodeIds/linkIds, positions, routes. The main ID is main. Views reference global content rather than copying it. Positions contain x/y; routes contain path, label box, endpoint signature, and layout version.
- locale: languageTag matching confirmed interactionLanguage.tag; ui, statuses, nodeTypes, and relationLabels dictionaries. English defaults come from the packaged dictionary. Other languages require complete saved translations supplied by the agent before render. Canonical IDs and labels do not change. Field names are stable English keys.
- history: retiredNodes/retiredLinks/retiredTrees preserve original item, reason, and revision; redirects/linkRedirects retain merged identity; relationExtensions define genuinely new meanings without replacing core definitions.

Source references contain sourceId and location identifying a registered source and locator. Clearly distinguish background, inference, user notes, and fictional examples; do not invent figure identifiers to fill fields.

The website receives a same-revision display snapshot with necessary sources, terms, settings, active graph, locale, and version hashes. Full reading memory and history stay in session. Browser notes are separate and must pass identity/relation/evidence checks before merging.
