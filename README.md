# Paper Reading Skills

Four public skills for understanding research papers across disciplines. English instructions define the workflow; each paper session asks for its output language and whether to produce a full translation (**Yes by default**). Explanations, questions, and map content then use the saved language.

## Public entries

- [paper-prepare](skills/paper-prepare/SKILL.md): identify the primary paper, collect/check sources, select an expert perspective, build a whole-paper model, and produce the aligned translation when enabled.
- [paper-figure-explain](skills/paper-figure-explain/SKILL.md): give a short overview, display actual figures, explain main figures/panels in order, and include essential supporting evidence.
- [paper-detail-explain](skills/paper-detail-explain/SKILL.md): build a complete reader guide and teach the entire paper as a connected research narrative, including methods and calculations. Segmented delivery follows substantial chapters of that whole.
- [paper-ask](skills/paper-ask/SKILL.md): answer questions directly with necessary context and evidence, preserving the interrupted reading position.

These are the only public entries. Thirteen [internal interfaces](interfaces/) are path-loaded resources, not additional user workflows. The plugin manifest exposes only skills/. The structure uses focused processes and conditional references inspired by Matt Pocock's writing-for-agents approach.

## Setup behavior

For a new primary paper, the agent asks the language for the translated document and subsequent interaction, and whether a full-paper translation is wanted. The full-translation default is Yes; a language is never inferred from the English instructions, source language, machine locale, or silence. Existing explicit instructions and confirmed session preferences are reused. If full translation is declined, other reading functions remain available in the chosen language, including requested local passage translations.

Independent inventory, downloads, extraction checks, indexing, and internal reading can proceed while setup answers are pending. Confirmed settings are saved before language-dependent output. Later entries restore the same settings, role, terminology, evidence, and progress. See the [startup contract](interfaces/paper-memory/references/settings-contract.md).

## Install locally in Codex

Use Python 3.11 or later; runtime helpers have no third-party dependencies.

```sh
git clone https://github.com/nekoyanke666/Paper-Reading-Skills.git
cd Paper-Reading-Skills
python scripts/install.py
```

The installer places four entries under `$CODEX_HOME/skills` (default `~/.codex/skills`) and shared resources under `$CODEX_HOME/paper-reading-skills`. It rewrites only installed entry links to that shared location. Internal interfaces stay outside discovery. Existing unrelated destinations are not overwritten. Keep skills/ and interfaces/ together when using the repository as a plugin instead.

Installed skills should be available on the next turn. If the host has not refreshed its inventory, start a new chat or restart the app.

Use `$paper-prepare` with a primary paper, then `$paper-figure-explain`, `$paper-detail-explain`, or `$paper-ask` as needed. Setup questions belong to these entries, not a fifth start skill.

## Research and map behavior

Whole-paper guidance requires reading complete sources and essential evidence, then saving an integrated research model. Partial questions remain scoped honestly. Shared terms, claims, locations, role, and separate translation/figure/detail progress make segmentation recoverable; a summary or map is not a substitute for understanding.

Full detail explanation starts from research context for a new whole-paper request, preserving previous sources and terminology without automatically resuming an old teaching cursor. Explicit continuation resumes the current narrative. Before delivering its chapters, the agent writes a complete reader-facing manuscript and source crosswalk; it then uses the saved segmented/single preference. Meaningful recall and worked technical reasoning support returning to the original text, equations, and methods. Manuscript readiness, chapters delivered, and reader understanding are tracked separately. See the [full-explanation contract](interfaces/paper-narrative/references/full-explanation.md) and [semantic review cases](docs/detail-narrative-cases.md).

The [map interface](interfaces/paper-map/SKILL.md) uses a locked minimal template, stable identities, a canonical relationship registry, explicit lifecycle, and deterministic snapshots. Canonical English IDs/labels remain stable while selected-language display dictionaries are saved separately. Non-English maps require complete UI/relationship localization before rendering. Language changes preserve identities and version affected outputs.

paper-prepare now prepares a stable map entry by default and supplies its first usable link promptly, including during batched preparation. Incomplete evidence can produce an honest provisional root without invented relationships. Every invocation of all four entries evaluates whether the tree needs updating; no meaningful change leaves the graph and artifact unchanged. Updates retain the same entry, with a brief change notice. A new conversation sharing the paper receives the existing link once. See the [entry/link contract](interfaces/paper-map/references/delivery.md).

The main map now audits whole-paper conceptual coverage rather than treating connectivity or a small node count as completion. One-to-many and many-to-one branches retain explicit meanings and evidence. Secondary topic catalogs collect terminology with no required root or connecting lines; figure/detail/ask explain terms immediately and retain definitions, study roles, verified properties, and sources for later lookup. Categories follow the paper's domain, and shared terms reuse IDs across catalogs and argument views. See [concept coverage](interfaces/paper-map/references/concept-coverage.md) and [topic catalogs](interfaces/paper-map/references/topic-catalogs.md).

Nodes use four semantic shapes for concepts, methods, named objects/terms, and propositions. Any node can lead to a necessary concept or object; comparison questions identify the actual alternatives. Drag nodes with live edge feedback, choose curves or straight lines, save positions in the current browser, or restore the current tree's default. Saved placements remain local view preferences; scientific IDs, source-backed relationships, and cross-tree sharing stay in canonical memory. The [content model](interfaces/paper-map/references/content-model.md) and [interaction contract](interfaces/paper-map/references/interaction.md) define the reusable format across disciplines.

Open the fictional [theory map](examples/theory-map/index.html), [feedback map](examples/feedback-map/index.html), or [terminology map](examples/terminology-map/index.html) after cloning. The terminology example includes rootless unconnected terms, a sparse catalog, shared definitions, and a one-to-many branch. These demonstrate the interface, not validated paper interpretations. Localized wording still requires expert review: machines check structure/completeness, not linguistic truth or academic correctness.

## Validate

```sh
python -m unittest discover -s tests -v
python scripts/validate_package.py
node tests/map_runtime.cjs
node tests/map_interactions.cjs
node tests/map_catalogs.cjs
```

Tests cover memory/readiness, setup preferences, relationships, lifecycle, localization, transactional updates, installer ownership, and reproducibility. JavaScript runtime checks use a minimal DOM substitute rather than a browser. Real-paper teaching quality and browser visual QA remain separate checks and must not be claimed when unperformed.
