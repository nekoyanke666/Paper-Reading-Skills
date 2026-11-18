# Paper Reading Skills

Six public skills for understanding research papers across disciplines. English instructions define the workflow; each paper session asks for its output language and whether to produce a full translation (**Yes by default**). Explanations, questions, and map content then use the saved language.

In detail, figure and question work, every occurrence of an important translated concept or technical term carries its verified English name immediately beside it, including repeated mentions and bold terms. Earlier appearances or a separate glossary never make later English names optional. The surrounding explanation remains in the saved interaction language.

## Public entries

All six public entries and thirteen internal interfaces explicitly prioritize the reader's time. Narrow questions use scoped context and evidence retrieval; valid prior work is reused; full preparation, manuscript rebuilding and map rendering run only when the requested task needs them. Required completeness, source checks, per-mention English terminology and saved-history protection remain in force.

- [paper-prepare](skills/paper-prepare/SKILL.md): identify the primary paper, collect/check sources, select an expert perspective, build a whole-paper model, and produce the aligned translation when enabled.
- [paper-figure-explain](skills/paper-figure-explain/SKILL.md): give a short overview, display actual figures, explain main figures/panels in order, and include essential supporting evidence.
- [paper-detail-explain](skills/paper-detail-explain/SKILL.md): build a complete reader guide and teach the entire paper as a self-contained expert narrative, including background, methods and calculations, without assuming earlier teaching. Recorded personal connections are optional supplements after the relevant core explanation. Segmented delivery follows substantial chapters of that whole.
- [paper-ask](skills/paper-ask/SKILL.md): answer questions directly with necessary context and evidence, preserving the interrupted reading position.

- [paper-add-map](skills/paper-add-map/SKILL.md): create a new topic tree in the same map, including unconnected term catalogs; inspect related trees and propose integration when useful, or directly apply explicitly requested integration.
- [paper-skill-help](skills/paper-skill-help/SKILL.md): list the six public skills with usage examples, including trees with and without integration, without changing a paper or map.

These are the only public entries. Thirteen [internal interfaces](interfaces/) are path-loaded resources, not additional user workflows. The plugin manifest exposes only skills/. The structure uses focused processes and conditional references inspired by Matt Pocock's writing-for-agents approach.

## Setup behavior

For a new primary paper, the agent asks the language for the translated document and subsequent interaction, and whether a full-paper translation is wanted. The full-translation default is Yes; a language is never inferred from the English instructions, source language, machine locale, or silence. Existing explicit instructions and confirmed session preferences are reused. If full translation is declined, other reading functions remain available in the chosen language, including requested local passage translations.

Independent inventory, downloads, extraction checks, indexing, and internal reading can proceed while setup answers are pending. Confirmed settings are saved before language-dependent output. Later entries restore the same settings, role, terminology, evidence, and progress. See the [startup contract](interfaces/paper-memory/references/settings-contract.md).

## Install locally in Codex

Use Python 3.11 or later for the workflow helpers and Node.js for the local Save-enabled viewer. Neither requires third-party packages; the local service was tested with Node 24.

```sh
git clone https://github.com/nekoyanke666/Paper-Reading-Skills.git
cd Paper-Reading-Skills
python scripts/install.py
```

The installer places six entries under `$CODEX_HOME/skills` (default `~/.codex/skills`) and shared resources under `$CODEX_HOME/paper-reading-skills`. It rewrites only installed entry links to that shared location. Internal interfaces stay outside discovery. Existing unrelated destinations are not overwritten. Keep skills/ and interfaces/ together when using the repository as a plugin instead.

Installed skills should be available on the next turn. If the host has not refreshed its inventory, start a new chat or restart the app.

Use `$paper-prepare` with a primary paper, then `$paper-figure-explain`, `$paper-detail-explain`, or `$paper-ask` as needed. Use `$paper-add-map` for a requested new topic tree in the existing map and `$paper-skill-help` for usage examples. Help works without a paper or setup questions.

## Research and map behavior

The map is organized as a domain expert's model of the knowledge and research logic: substantive concepts/objects, mechanisms or arguments, methods, evidence and meaningful relationships. Its structure is not the order of questions or answers in a chat. Node labels remain concise; the sidebar provides a complete local explanation of the referent, relevant workings and study role without relying on old examples or figure warnings. See the [expert content model](interfaces/paper-map/references/content-model.md) and [node explanation contract](interfaces/paper-map/references/node-explanations.md).

Whole-paper guidance requires reading complete sources and essential evidence, then saving an integrated research model. Partial questions remain scoped honestly. Shared terms, claims, locations, role, and separate translation/figure/detail progress make segmentation recoverable; a summary or map is not a substitute for understanding.

Full detail explanation starts from research context for a new whole-paper request, preserving previous sources and terminology without automatically resuming an old teaching cursor. Explicit continuation resumes the current narrative. Before delivering its chapters, the agent writes a complete reader-facing manuscript and source crosswalk; it then uses the saved segmented/single preference. Meaningful recall and worked technical reasoning support returning to the original text, equations, and methods. Manuscript readiness, chapters delivered, and reader understanding are tracked separately. See the [full-explanation contract](interfaces/paper-narrative/references/full-explanation.md) and [semantic review cases](docs/detail-narrative-cases.md).

The [map interface](interfaces/paper-map/SKILL.md) uses a locked minimal template, stable identities, a canonical relationship registry, explicit lifecycle, and deterministic snapshots. Canonical English IDs/labels remain stable while selected-language display dictionaries are saved separately. Non-English maps require complete UI/relationship localization before rendering. Language changes preserve identities and version affected outputs.

paper-prepare prepares a stable map entry by default and supplies its first usable link promptly, including during batched preparation. Incomplete evidence can produce an honest provisional root without invented relationships. The five paper-content entries evaluate meaningful map updates; paper-skill-help is read-only. An explicit paper-add-map request creates its requested topic tree even when the main research chain is unchanged. Updates retain the same entry, with a brief change notice. A new conversation sharing the paper receives the existing link once. See the [entry/link contract](interfaces/paper-map/references/delivery.md).

The main map now audits whole-paper conceptual coverage rather than treating connectivity or a small node count as completion. One-to-many and many-to-one branches retain explicit meanings and evidence. Secondary topic catalogs collect terminology with no required root or connecting lines; figure/detail/ask explain terms immediately and retain definitions, study roles, verified properties, and sources for later lookup. Categories follow the paper's domain, and shared terms reuse IDs across catalogs and argument views. See [concept coverage](interfaces/paper-map/references/concept-coverage.md) and [topic catalogs](interfaces/paper-map/references/topic-catalogs.md).

Nodes use four semantic shapes for concepts, methods, named objects/terms, and propositions. Any node can lead to a necessary concept or object; comparison questions identify the actual alternatives. The canvas fills the remaining viewport with outer margins. Drag its background to pan freely, use the wheel or compact +/- controls to zoom, and Center to recenter the current tree without changing zoom or node placements. Entering selection, navigation, history/import and viewport/sidebar resize preserve zoom. Node inspection captures the browsing camera first; Close, Escape or a blank-canvas click restores that position and scale, including after inspecting several nodes. Sidebar resize and stale centering callbacks cannot recenter the whole tree over the restored view. Nodes and fonts use actual rendered dimensions and lines remain SVG vectors rather than a CSS-scaled board image. Drag nodes independently, including across the world origin, with live curved/straight edge feedback. Low/Medium/High select three independently curated trees, reusing the exact same global node definitions with separate positions and reviewed relationships; they are not automatic path-collapse projections.

Each paper allocates its own map folder in the current workspace, reserves history/ beside the HTML, and stores only relative configuration. Existing paper folders are reused across chats; different papers/workspaces remain independent and a complete folder can be relocated. The skill checks/starts the local service itself, opens the map in the available host browser panel, and provides a one-click web link. The reader clicks a clearly labeled Open paper map web link; typing a request or invoking a skill is not required. Before delivering it the agent repairs a stopped service while keeping the existing record. An explicit reopen request is also supported through paper-ask. In Codex, running a .cmd is not part of the normal flow. open-map.cmd and open-map.sh remain optional outside-app fallbacks. See the [opening contract](interfaces/paper-map/references/open-entry.md).

Save directly writes a portable full-diagram archive containing all nodes, edges, trees, detail views, definitions, sources, positions and version history. In the popover, Prev then Next navigate Save checkpoints on the first row, and Save occupies the next row. Editing an older version retains its former future. Base plus stable-ID deltas reduce record size without silently deleting history. Import restores a complete saved diagram, including another paper, through the fixed v1 format; even one-tree documents retain the full selector/import configuration. Ordinary Save uses that local history folder without a location picker or download, and a new page restores the actual file. Only Back up elsewhere asks where to put a separate copy; it leaves the managed record and unsaved status unchanged. Static HTML previews cannot write neighboring files and explain how to reopen the local entry. Browser recovery is supplementary. See [per-paper local storage](interfaces/paper-map/references/local-storage.md). See the [archive contract](interfaces/paper-map/references/history-format.md) and [detail views](interfaces/paper-map/references/detail-views.md). Scientific IDs and source-backed relationships stay in canonical research memory until user notes are explicitly reviewed. Selecting a node highlights incoming links in blue, outgoing links in green, self-loops in purple and undirected links in slate while unrelated content fades. Larger arrow/T endpoints and grouped source-to-target rows in the sidebar preserve direction without relying on color alone. This is temporary presentation and leaves graph data and saved history unchanged. See [direction focus](interfaces/paper-map/references/direction-focus.md). The [content model](interfaces/paper-map/references/content-model.md) and [interaction contract](interfaces/paper-map/references/interaction.md) define the reusable format across disciplines.

Open the fictional [theory map](examples/theory-map/index.html), [feedback map](examples/feedback-map/index.html), [terminology map](examples/terminology-map/index.html), [three-detail map](examples/detail-map/index.html), or [direction-focus map](examples/direction-map/index.html) after cloning. The terminology example includes rootless unconnected terms, a sparse catalog, shared definitions, and a one-to-many branch. These demonstrate the interface, not validated paper interpretations. Localized wording still requires expert review: machines check structure/completeness, not linguistic truth or academic correctness.

## Validate

```sh
python -m unittest discover -s tests -v
python scripts/validate_package.py
node tests/map_runtime.cjs
node tests/map_interactions.cjs
node tests/map_catalogs.cjs
node tests/history_core.cjs
node tests/history_viewer.cjs
node tests/detail_viewer.cjs
node tests/camera_viewer.cjs
node tests/camera_focus.cjs
node tests/direction_focus.cjs
node tests/managed_store.cjs
```

Tests cover memory/readiness, setup preferences, relationships, lifecycle, localization, transactional updates, installer ownership, and reproducibility. JavaScript runtime checks use a minimal DOM substitute rather than a browser. Real-paper teaching quality and browser visual QA remain separate checks and must not be claimed when unperformed.
