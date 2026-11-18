---
name: paper-translate
description: Internal interface. Produce full, continued, or local source-to-target translation and corrections with aligned locations, consistent terms, faithful logic and uncertainty, and independent translation progress.
---

# Paper Translate

**The user's time is valuable.** Minimize unnecessary waiting: reuse valid work, load only relevant material, and avoid redundant steps while preserving the requested completeness, evidence checks and saved-state safety.

Input: readable original, requested scope, confirmed language settings, glossary, and translation progress. Output: aligned original and target-language text, separate notes, terminology revisions, and remaining scope.

## 1. Confirm settings, source, and scope

Restore source/paragraph identifiers, terminology, progress, and confirmed settings. Use the shared startup protocol if missing; do not default to Chinese, English, the paper language, or the system locale.

Distinguish full, continued, local, and correction modes. A full preparation translation obeys fullTranslation, which defaults to Yes during setup. If No was chosen, skip the full document and record skipped-by-preference, not completed. Explicit local translation requests still work; a request to enable full translation updates the saved preference.

When originals are unavailable, corrupt, or cannot be supplied in full translation, identify exact affected ranges and consequences, offer feasible local explanation, and retain incomplete status. If source and target languages coincide, clarify whether an aligned original-language reading copy or another target is intended before producing a misleading “translation.”

## 2. Provide paragraph-aligned text

Follow source sections and paragraphs. Under each stable identifier, show original text followed by its target-language translation. Preserve headings, figure numbers, citations, equations, symbols, and necessary original/English technical terms. Include captions within the requested scope. Do not fabricate source text to fill extraction gaps.

Keep translation faithful and natural, preserving causality, comparison objects, negation, conditions, pronoun references, and uncertainty. Annotate source ambiguity or omission separately rather than silently resolving it into certainty. Improve awkward wording without changing the argument.

Use shared terminology and the [inline-English terminology rule](../paper-teach/references/terminology.md): every named occurrence of an important translated concept or technical term includes its verified English name immediately beside it, including repeats and emphasized terms. An aligned original paragraph is not a substitute for this pairing. Keep the translation in the selected language; English names are lookup anchors, not additional author claims. If no established target-language equivalent exists, retain the original term and explain the chosen rendering. For batches, state the current range, cumulative completion, and remaining ranges.

## 3. Separate translation from teaching

Maintain an independently browsable translation document so readers can cross-reference passages during figure or text explanation. Label teaching notes and external background separately; they must not become author statements inside the translation.

A completed translation neither proves whole-paper integration nor automatically starts figure or detailed explanation.

## 4. Correct and save

Recheck the original when correcting terms or meaning; update the glossary and affected previous translations rather than only the current paragraph. Save alignment, notes, language/settings version, and independent translation progress through [paper-memory](../paper-memory/SKILL.md).

Completion requires aligned, traceable scope, consistent terminology, explicit ambiguity, and truthful incomplete/skipped status. Language changes create a separately versioned translation or explicit migration; never relabel an old document as translated into the new language.
