---
name: paper-sources
description: Internal interface. Inventory, obtain, and quality-check a primary paper and directly related figures, methods, supplements, code, and data, or integrate new material/versions while reporting availability and consequences of gaps.
---

# Paper Sources

**The user's time is valuable.** Minimize unnecessary waiting: reuse valid work, load only relevant material, and avoid redundant steps while preserving the requested completeness, evidence checks and saved-state safety.

Input: paper clues, requested material scope, and current source index. Output: original files, source/version inventory, extraction quality and coverage updates, and the interpretive effects of gaps.

## 1. Identify material roles and versions

Initially skim the paper to inventory directly relevant full text, figures/captions, methods, supplements, Extended Data, and author-provided code/data. Record title, authors, identifiers, version, and primary source. Include actual proofs, materials, or other discipline-specific structure.

Trace attachments from the paper page, statements, and author-provided sources rather than recursively collecting every reference. Classify additions as supplement, background, code, data, a new version of the same paper, or a correction notice. Preserve the primary paper. Without primary context, identify material and address supported local tasks; ask its role only if it changes the scope.

## 2. Obtain necessary content and preserve provenance

Download needed content to sources/ with originals, provenance, and applicable versions. Distinguish located, downloaded, readable, and checked. Mark unavailable, not provided, and currently unnecessary explicitly. Explain which judgments a gap affects and continue unaffected work.

Confirm code/data origin, version, and purpose before deeper inspection. Public code does not establish reproducibility. Obtain large data only to the extent needed for understanding or requested verification, not an entire database by default.

Identification, inventory, download, extraction checks, indexing, and internal reading can proceed while startup language/preference answers are pending. Save findings, then present reader-facing material in the confirmed language; never guess it from the paper or machine locale.

## 3. Check extraction and reading quality

Check full-text completeness, multi-column order, headings/paragraph locations, equations, tables, figure/panel numbers, captions, methods/proofs/materials, and attachments. Resolve scrambled extraction or missing notation against original pages. Do not guess illegible figure text.

Use not-applicable only for genuinely absent structural elements with reasons; actual missing sources remain gaps. Downloaded does not mean read, and read does not mean checked.

## 4. Integrate updates and return

The first inventory covers all material required for the task. Later updates inspect changes relevant to the current question or previous conclusions and identify additions, limitations, or corrections. A new version can invalidate previous coverage; mark affected ranges for rechecking and return effects on translations, claims, and maps to the caller.

Save sources/coverage through [paper-memory](../paper-memory/SKILL.md). Completion requires traceable roles, versions, availability, locations, and gap consequences. Do not claim comprehensive checking of unread material or start translation/full guidance independently.
