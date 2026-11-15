---
name: paper-prepare
description: Prepare a primary paper, confirm its language and translation preference, collect and check sources, build whole-paper memory, and create a stable map entry with its first link. Evaluate meaningful tree updates on every invocation without restarting preparation for supporting material.
---

# Paper Prepare

Turn the primary paper into a verifiable, resumable reading workspace. Complete preparation includes source inventory, extraction quality, an expert profile, a whole-paper research model, and a source-to-target translation if enabled. If the user requests only part of this work, complete that scope and report the broader readiness state accurately.

## Process

### 1. Identify the paper and initialize settings

Read [paper-memory](../../interfaces/paper-memory/SKILL.md) and its startup-settings contract. Restore the paper identity, version, and existing session, or create a separate session for a new primary paper. When a single paper is supplied for deep reading, state briefly that it is the primary paper. Ask which paper is primary only when several plausible choices would materially change the work.

For a new session, ask two setup questions: which language the translated document and subsequent interaction should use, and whether to produce a full-paper translation, with **Yes as the default**. Reuse explicit instructions already provided; do not repeatedly ask for saved settings. If full translation is declined, the language still governs explanation, questions, and map content.

Ask while beginning independent work when possible: bibliographic identification, inventory, downloading, extraction checks, and source indexing do not require a target language. Keep unanswered required settings pending; elapsed time is not confirmation. After the required answers or accepted defaults are clear, save confirmed settings before producing language-dependent material, then begin that work without another approval step.

Determine whether this request is full preparation, continuation, download, translation, or an update. Supporting files, background papers, code, datasets, and versions of the same paper do not silently replace the primary paper. Duplicate files do not trigger retranslating unchanged content. Finish this step with an identified primary paper, a defined scope, and an honest settings state.

### 2. Obtain and check materials

Read [paper-sources](../../interfaces/paper-sources/SKILL.md) in initial-inventory or update mode. Obtain the full text, figures and captions, actual methods/proofs/materials, supplements, Extended Data, and necessary code and data. Distinguish located, downloaded, readable, and checked. Preserve originals and location indexes; explain the consequences of missing material.

Confirm the origin, version, and purpose of repositories and large datasets before obtaining only what the current understanding or verification requires. Resolve scrambled text, damaged equations, and illegible figures against original pages before translating or interpreting the affected content.

### 3. Establish the expert perspective and whole-paper model

Read [paper-expert](../../interfaces/paper-expert/SKILL.md) to select a provisional perspective from the research question, contribution, and methods. Announce it concisely in the confirmed interaction language. Read [paper-teach](../../interfaces/paper-teach/SKILL.md) and [paper-evidence](../../interfaces/paper-evidence/SKILL.md) so explanation and interpretation follow the same rules.

For full preparation, read the complete text, all main figures and captions, methods needed for interpretation, and essential supporting evidence. Use paper-memory to build complete section coverage, research questions, conceptual dependencies, claims and evidence, limitations, and an integrated synthesis. Confirm the expert profile against the full paper. Save important terms and claims in the shared glossary and claim index.

Partial requests may remain partial. Mark the reading model verified only when paper-memory's coverage and integration requirements are met. A completed translation or summary alone does not establish whole-paper understanding.

### 4. Prepare the map entry and deliver its first link

Call [paper-map](../../interfaces/paper-map/SKILL.md) by default once the primary paper and interaction language are confirmed. Restore its existing entry or create a minimal source-backed map; no separate map request is required. Save one stable entry path in this paper's session. If the research model is still partial, mark the initial content provisional and do not invent relationships to fill the tree.

As soon as the entry is usable and required checks succeed, provide its clickable link in the current response, even if translation or later preparation continues in batches. If a current entry already exists, reuse it and provide its saved link if this conversation has not received one. Missing sources may limit the content without preventing a minimal entry; unresolved language or an actual generation failure remains an explicit pending task.

### 5. Produce the requested translation

Check the saved full-translation preference. If enabled, read [paper-translate](../../interfaces/paper-translate/SKILL.md) and produce an aligned source-to-target document using shared terminology and stable source/paragraph identifiers. Batch long documents while preserving cumulative completion and missing ranges. Keep teaching commentary separate from translation.

If disabled, record full translation as skipped by preference rather than completed. Retain originals and indexes for later explanations and targeted translation requests. A later request to enable full translation updates the setting and resumes the appropriate scope without repeating source collection.

### 6. Review the tree, save, and deliver results

Every invocation, including continuations, updates, and translation-only requests, evaluates whether this work changes important concepts, evidence, relationships, scope, or corrections. Apply meaningful changes through paper-map; otherwise record the no-change decision and retain the tree. Evaluation is required, additions are not.

Save settings, sources, expert profile, coverage, model, terms, claims, translation status, map entry/review, and gaps through paper-memory. Deliver the source inventory, requested translation, readiness, and outstanding work. Follow paper-map's link-delivery contract: reuse the same entry after updates and briefly state meaningful changes rather than repeatedly presenting a new link.

Completion requires verifiable scope, explained gaps, recoverable memory, and a delivered usable map entry or a specific blocker. Continue into figure or detailed guidance when already requested; otherwise finish with the preparation deliverables.
