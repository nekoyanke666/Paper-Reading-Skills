# English Translation and Workflow Review

All four entry instructions, thirteen internal interfaces, focused reference documents, default UI text, relationship definitions/aliases, example content, and supporting messages are in English. The instructions govern behavior; English is not a fixed language for future paper sessions.

## Review basis

The English release was compared with the preceding Chinese draft and the accepted requirements. The review checked meaning, task scope, instruction strength, ordering, exceptions, and cross-references rather than only checking whether non-English characters remained. The original requirement groups are preserved in these principal owners:

- Reader background, essential detail, terminology, bounded analogy, transitions, and necessary recall: paper-teach.
- Sources, finding/interpretation/inference separation, uncertainty, causality, proof, generalizability, and correction propagation: paper-evidence.
- Motivation, complete research logic, source crosswalk, substantive methods, discussion, and completion coverage: paper-narrative.
- Original figure display, panels/axes/groups, controls, observations, statistics, limits, and critical supplements: paper-figures and paper-methods.
- Direct answers, mistaken premises, ambiguity, case routing, mixed/unlisted cases, and requested understanding checks: paper-answer.
- Source collection, origin/version, extraction quality, aligned translation, and truthful missing/skipped ranges: paper-sources and paper-translate.
- Whole-paper memory before segmentation, stored explanations, shared terms/claims, independent progress, and interruption recovery: paper-memory.
- Discipline-specific role selection, announcement, persistence, confirmation, and justified updates: paper-expert.
- Fixed minimal map surface, stable identities, canonical relationship semantics, cycles, arbitrary extension, shared nodes, global search, lifecycle, stable layout, and explicit quality gates: paper-map and its focused references.
- Only four public workflows, ordered scope, selective internal calls, and no independent extra entry: skills/ and the plugin/installer boundaries.

## Deliberate changes requested for this release

Fixed Traditional Chinese output becomes the confirmed target/interaction language. Aligned English–Chinese translation becomes original-to-target translation. Study terminology retains its original/English form when useful alongside target-language meaning. Biological wording remains discipline-appropriate rather than imposing a biomedical role.

Startup asks the output language and whether a full-paper translation is wanted, default Yes. Independent source preparation can proceed while answers are pending. Language is never inferred from the English instructions, source, system locale, or silence. Confirmed settings are saved before substantive language-dependent output and restored across all entries. Declining full translation skips that document, not reading or local translation questions.

The map's canonical registry labels are now English while predicate IDs and meanings are preserved. Registry version 2.0.0 records the label/alias change; UI version 1.1.0 adds locale dictionaries while retaining the same CSS, node dimensions, minimal controls, sharing, sidebar, and graph interaction. Non-English content requires saved localized labels and UI rather than changing canonical semantic IDs. Existing actual paper sessions must be migrated explicitly, not silently reinterpreted.

## Limits of the checks

Automated tests validate persistence, defaults/decline behavior, stale-state rejection, graph semantics/geometry, localization structure, installer boundaries, and reproduction. The synthetic non-English locale fixture verifies routing/completeness, not a real Spanish translation. The English instruction review is a semantic review of this release, not a claim of infallible wording or an independent agent evaluation.

No real-paper teaching evaluation has been performed. Version 1.1.0 browser checks use fictional fixtures; their exact viewport and interaction coverage is recorded separately in docs/browser-qa.md. Minimal-DOM runtime tests are reported as runtime tests. See [validation instructions](../README.md#validate) and [machine results](validation.json).

## Version 1.0.1 workflow refinement

Preparation now creates or restores the map entry by default and delivers its first usable link without waiting for the full translation. All four entries explicitly review updates on every invocation; mutation remains conditional on meaningful content. The shared delivery contract specifies stable paths, provisional minimal content, same-entry updates, and first delivery in each conversation. This changes timing and delivery policy without changing the map template, relationship meanings, or number of public entries.

## Version 1.1.0 reusable map contract

Four semantic shape roles, substantive object/concept modeling, pure cubic/straight edges, direct dragging, browser-local saved placements, view-scoped defaults, and responsive feedback are integrated into paper-map and its conditional references. The four public entry routes and saved-language workflow are unchanged. New UI labels require complete selected-language translations during migration; scientific predicate IDs and meanings remain unchanged. The viewer sources are maintained separately and compiled into the locked reusable template.
