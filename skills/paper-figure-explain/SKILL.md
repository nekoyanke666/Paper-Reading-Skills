---
name: paper-figure-explain
description: Introduce a primary paper, then display and explain its main figures in figure and panel order, including essential supporting evidence. Restore the saved language, research model, and position; a local figure request does not start a full-paper lecture.
---

# Paper Figure Explain

Help the reader first follow how the figures connect the research question, evidence, and conclusions. A full guide follows main-figure and panel order. A specified figure requires only that scope and its necessary prerequisites.

## Process

### 1. Restore context and check readiness

Read [paper-memory](../../interfaces/paper-memory/SKILL.md), [paper-expert](../../interfaces/paper-expert/SKILL.md), [paper-teach](../../interfaces/paper-teach/SKILL.md), and [paper-evidence](../../interfaces/paper-evidence/SKILL.md). Restore settings, paper, integrated model, expert profile, terminology, evidence index, figure progress, and interruption point. If this is the first entry used, run paper-memory's startup protocol; do not force a separate preparation invocation.

Use the confirmed interaction language throughout. Full-translation preference does not gate figure reading. Complete figure-by-figure guidance requires a verified model built by reading the whole paper and essential material. If missing, obtain sources through [paper-sources](../../interfaces/paper-sources/SKILL.md) and complete integration through paper-memory. If essential sources remain unavailable, state the valid local scope instead of claiming full readiness.

### 2. Establish a brief overview

At the first opening, call [paper-narrative](../../interfaces/paper-narrative/SKILL.md) in overview mode: existing knowledge, gap, core question, research object, main findings, and significance. On continuation, recall only what is needed for the current figure rather than restarting the introduction.

### 3. Explain each figure in order

Call [paper-figures](../../interfaces/paper-figures/SKILL.md) in complete-figure mode. Give the figure's purpose and necessary background, display the actual figure with its identifier, explain each panel's reading, design, comparisons, observations, conclusions, and limits, then integrate the panels.

Explain required technical names and abbreviations where they first matter, including their original/English forms and study-specific meaning. Follow paper-teach's terminology contract to retain useful definitions/properties in topical catalogs through paper-map; the term need not be a main result to merit a definition.

When methods, statistics, equations, or proofs obstruct understanding, call [paper-methods](../../interfaces/paper-methods/SKILL.md), explain enough to interpret the current evidence, and return to the figure. Adapt to the actual figure type; do not invent groups, sample sizes, or error bars for theoretical or qualitative figures.

Apply paper-figures' supporting-evidence rule: discuss controls, validation, or limitations that materially affect the main conclusion beside the relevant main figure and explain why they are needed. Index the remaining supplements without routinely explaining every item.

### 4. Save after a complete topic

Save explained figures/panels, necessary reminders, source and aligned-translation locations when available, important claims, open questions, and the next step. On every invocation, and after each complete topic in a longer run, explicitly evaluate whether important concepts, relationships, evidence, scope, or corrections require a tree update. Use [paper-map](../../interfaces/paper-map/SKILL.md) for meaningful changes or a missing entry, and save the decision even when no change is needed. Repetition or a clarified definition may only update an existing term/node.

Restore the stable entry saved during preparation. If this entry is used directly and none exists, create a minimal one after settings are confirmed. Follow paper-map's link-delivery contract: provide the first usable link in this conversation, reuse it after updates, and briefly report meaningful changes. Do not force a new node on every call.

Route inserted questions through [paper-ask](../paper-ask/SKILL.md), preserving returnTo. Continue from the interruption when requested; answering a question does not automatically complete the original figure.

### 5. Integrate and verify completion

After the requested figures, call paper-narrative in post-figure integration mode. Return to relevant prose to connect the research story and cover background, methods, discussion, and limitations not sufficiently conveyed by the figures for this stage.

Check each requested figure and panel has received substantive explanation. Identify unavailable, illegible, and unexplained parts. Save figure progress separately from detailed-text progress; do not automatically start paper-detail-explain unless continuation was requested.
