---
name: paper-simple-explain
description: Explain a paper's main research story briefly for a non-specialist, with clear small-topic headings, concrete reasons for each step, key methods/evidence and essential limits. Standalone and source-grounded; a shorter alternative to full detail, without requiring its exhaustive manuscript or advancing its saved progress.
---

# Paper Simple Explain

**The user's time is valuable.** Minimize unnecessary waiting: reuse valid work, load only relevant material, and avoid redundant steps while preserving the requested completeness, evidence checks and saved-state safety.

Give the important research chain in a shorter account: why the question matters, what the previous approach leaves unresolved, how the central solution addresses it, what the evidence shows and what remains uncertain. Preserve a clear reason-to-result narrative and an appropriate expert perspective while selecting less technical detail than paper-detail-explain. Prior conversations are optional context, never required premises.

## 1. Restore the paper and requested scope

Read [paper-memory](../../interfaces/paper-memory/SKILL.md), [paper-expert](../../interfaces/paper-expert/SKILL.md), [paper-teach](../../interfaces/paper-teach/SKILL.md) and [paper-evidence](../../interfaces/paper-evidence/SKILL.md), reusing instructions still accessible in context. Restore the paper/version, confirmed language/presentation, expert profile and relevant source-grounded model. Select an expert profile when absent and briefly state the lens in the explanation. Ask only for genuinely missing shared setup settings; independent source inspection may proceed while answers are pending. Full-translation preference does not gate this explanation or start a translation run.

A new request for the paper's main story starts at its research context. Resume a saved simple run only when continuation is requested or unambiguous. A specifically requested local topic stays scoped. Preserve the figure/detail reading position and any interrupted return point; a simple explanation does not silently resume or complete them.

## 2. Verify and select the main argument

Call [paper-narrative](../../interfaces/paper-narrative/SKILL.md) in concise-explanation mode and read its [concise contract](../../interfaces/paper-narrative/references/concise-explanation.md). Use the primary text, relevant main figures/captions, core methods and essential supporting evidence to verify the main question, contribution, decisive results and limits. Reuse valid source checks. Use [paper-sources](../../interfaces/paper-sources/SKILL.md) only for missing material needed here. With abstract-only or missing essential evidence, explain the supported scope and gaps rather than claiming a verified complete research story.

Build a compact source-to-topic crosswalk. Do not generate the full-detail manuscript, explain every figure/panel or expand routine implementation steps unless the user requests them or a central inference requires them.

## 3. Deliver a concise, motivated narrative

Apply [topic flow and motivation](../../interfaces/paper-narrative/references/topic-flow.md): short informative subheadings, normally three to five brief stages, and connected explanatory prose. At each stage's opening make the current question, concrete reason/stakes and relevant paper text/figure clear before explaining the content. Avoid an isolated list of findings or a generic "this is important" transition. Strong narrative reasons do not permit upgrading association or hypothesis into scientific causality.

Explain essential terms in plain language. Apply paper-teach's inline-English rule on every important translated term occurrence, including repeats and bold headings. Keep necessary prerequisites and inference boundaries while omitting nonessential derivations and secondary details. Call [paper-methods](../../interfaces/paper-methods/SKILL.md) or [paper-figures](../../interfaces/paper-figures/SKILL.md) only for checks needed to explain the core evidence.

For a topic mainly based on Supplementary Information, an appendix or Extended Data, add a parenthetical source/required-or-optional label in the saved language and state why. Important supplemental controls stay in the core; optional detail must be skippable without losing its logic. Use a brief explicit recall when a later result depends on an earlier concept. Keep the complete core understandable without an old chat or a map.

## 4. Save and offer the next depth

Save the concise explanation, source crosswalk, terms/claims, optional topics, limits, actual delivery and next boundary under progress.simple. Keep its completion independent of progress.detail, figures and translation. Route interruptions through [paper-ask](../paper-ask/SKILL.md), retaining the simple return point.

Review meaningful map changes through [paper-map](../../interfaces/paper-map/SKILL.md); preserve identities, saved edits and the existing map link, and avoid rendering when no material change is needed. Deliver the main conclusion and limits without extra procedural narration. If useful, briefly point to [paper-detail-explain](../paper-detail-explain/SKILL.md) for full mechanisms, calculations and methods; do not start it automatically or require another choice to receive the requested concise account.
