# Paper Reading Skills

Four public skills for understanding research papers across disciplines. English instructions define the workflow; each paper session asks for its output language and whether to produce a full translation (**Yes by default**). Explanations, questions, and map content then use the saved language.

## Public entries

- [paper-prepare](skills/paper-prepare/SKILL.md): identify the primary paper, collect/check sources, select an expert perspective, build a whole-paper model, and produce the aligned translation when enabled.
- [paper-figure-explain](skills/paper-figure-explain/SKILL.md): give a short overview, display actual figures, explain main figures/panels in order, and include essential supporting evidence.
- [paper-detail-explain](skills/paper-detail-explain/SKILL.md): explain the complete research logic and substantive text, segmented or in one delivery.
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

The [map interface](interfaces/paper-map/SKILL.md) uses a locked minimal template, stable identities, a canonical relationship registry, explicit lifecycle, and deterministic snapshots. Canonical English IDs/labels remain stable while selected-language display dictionaries are saved separately. Non-English maps require complete UI/relationship localization before rendering. Language changes preserve identities and version affected outputs.

Open the fictional [theory map](examples/theory-map/index.html) or [feedback map](examples/feedback-map/index.html) after cloning. These demonstrate the interface, not validated paper interpretations. Localized wording still requires expert review: machines check structure/completeness, not linguistic truth or academic correctness.

## Validate

```sh
python -m unittest discover -s tests -v
python scripts/validate_package.py
```

Tests cover memory/readiness, setup preferences, relationships, lifecycle, localization, transactional updates, installer ownership, and reproducibility. JavaScript runtime checks use a minimal DOM substitute rather than a browser. Real-paper teaching quality and browser visual QA remain separate checks and must not be claimed when unperformed.
