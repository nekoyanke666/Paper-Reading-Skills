---
name: paper-memory
description: Internal interface. Restore the paper, language settings, research model, expert profile, and position at entry; persist sources, terms, claims, explanatory content, questions, corrections, and map state consistently after work.
---

# Paper Memory

Input: paper identity clues, requested scope, and any existing session. Output: traceable context, confirmed or pending settings, readiness, a resume point, and a committed revision.

## 1. Restore or initialize the session

Read the [session contract](references/session-contract.md). Keep mutable memory at `work/papers/<stable-paper-id>/paper-session.json`, originals in sources/, and location indexes and necessary extracted content in corpus/. Do not store per-paper state inside reusable skill files.

Identify the primary paper/version, then restore settings, roleProfile, readingModel, sources/coverage, glossary, claims, questions/corrections, and progress. A new primary paper gets a separate session; supporting papers, files, and code do not replace it. Restore the whole model before retrieving the current source and surrounding context. Chat summaries alone are insufficient.

Calling an interface means reading its linked instructions, executing them, and returning to the caller; it does not create another agent. Reuse instructions already read and still directly accessible in the same task. Reread after context loss or when inaccessible. Interfaces handle their caller's scope without restarting entries or recursively reacquiring the same dependencies.

## 2. Resolve startup settings

Read the [startup-settings contract](references/settings-contract.md) for a new session, missing settings, or a requested preference change. Ask the target document/interaction language and whether a full-paper translation is wanted; the latter defaults to Yes. Existing explicit answers and saved confirmed settings take precedence over defaults.

Independent identification, downloads, extraction, indexing, and internal research-model work may proceed while answers are pending. Use the user's current conversation language for setup questions. Do not infer a target language from the English skill instructions, the paper language, locale, or silence. Before translated documents, teaching, answers, or map output begin, persist confirmed settings and then use that language throughout. A declined full translation skips that deliverable, not understanding or other entry points.

## 3. Check readiness for whole-paper guidance

Before full figure or detailed guidance, read the entire text, all main figures/captions, actual methods/proofs/materials, and supporting evidence essential to the main conclusion. Build complete coverage with source, locator, read/checked status, then integrate questions, the whole outline and dependencies, claims/evidence, methodological premises, limitations, and unknowns.

Mark readingModel.status=verified only when required sources are available, all requiredCoverageIds are verified, the full model is integrated, and the expert profile is confirmed. Missing essential material leaves the model partial with explained effects. Local questions may proceed within the supported scope. Follow actual structure rather than inventing sections or labeling missing content inapplicable.

Passing fields cannot prove reading or understanding. A translation, concept map, or long summary is not sufficient evidence of readiness.

## 4. Preserve resumable teaching

Save the whole plan before segmentation. At each segment, restore sources, evidence, and necessary context; afterward save reader-facing explanatory content, its basis, terms, conclusions, limitations, questions, and next step. Do not request hidden reasoning.

Track translation, figures, and detail separately. Keep full translation disabled/skipped distinct from completed. Preserve returnTo for inserted questions; answering does not complete the interrupted lesson. Record only whether something was explained, the reader reported understanding, or questions remain; do not assume comprehension.

The glossary unifies source terms, English terminology where useful, target-language terms, aliases, study-specific meaning, prerequisites, and sources. Claims record statement, evidence kind, locator, conditions, limits, and status. Settings, expert profile, and graph share this session rather than contradictory copies.

## 5. Commit and verify recovery

Use the [session store](scripts/session_store.py), or an equivalent verifiable write, with the expected revision, reason, atomic replacement, and preserved history. Reject stale writes and cross-paper overwrites. Substantive role changes need a reason and increased role version. Preference changes need settings revision and impact tracking; corrections update dependent claims, explanations, translations, and maps.

Let paper-map commit its changes against the same canonical session; do not overwrite it later with a stale caller copy. Progress-only updates or repetition need not regenerate the map. Save canonical state before a matching map snapshot. Keep browser notes separate until reviewed and merged.

Return only after the current work, sources, and position can be recovered, or clearly report failure and preserve recovery material. Do not claim a failed save succeeded or pretend to remember unreadable state.
