---
name: paper-translate
description: Internal interface. Produce faithful page/paragraph/sentence-aligned paper translations with authentic original graphics, localized in-figure text and the authors' own captions kept with their images. Prefer source-like layout and a target-language main document, retain original comparison, and track text/image completion without adding figure teaching.
---

# Paper Translate

**The user's time is valuable.** Minimize unnecessary waiting: reuse valid work, load only relevant material, and avoid redundant steps while preserving the requested completeness, evidence checks and saved-state safety.

Input: original text, pages and figure assets, requested scope, confirmed language settings, glossary and progress. Output: faithful source-followable translation with source-like page layout, localized figure text and translated author captions; no newly written figure interpretation.

## 1. Confirm the source, settings and scope

Restore the source/version, requested range, glossary, confirmed target language and prior progress. Use the shared startup protocol only for missing settings. Full preparation translation follows fullTranslation, default Yes at setup; a declined full translation does not block an explicit local request. When source material is unavailable or unreadable, record exact gaps and supported scope instead of fabricating text or graphics.

Read [page and sentence alignment](references/page-alignment.md) and, for image-containing scope, [figure units](references/figure-units.md). Inventory the actual pages, logical paragraphs/sentences, figures, in-figure labels and associated author captions through paper-sources, reusing checked assets. Here figure caption/figure legend means the authors' original accompanying text, not a new assistant explanation.

Choose a target-language main document with retained originals for parallel lookup, using the source page/column/figure/caption placement as the layout template. Keep bilingual comparison in a separate view/document when useful rather than doubling every paragraph or image inside the layout-matched main version. This default needs no additional bilingual-preference question. Reuse explicit user choices and recorded presentation decisions.

## 2. Translate faithfully in source reading order

Use stable page/paragraph/sentence locators to identify the next untranslated unit and resume point. Reconstruct logical reading order from page layout and complete sentences, not arbitrary PDF line wraps. Preserve the source's section order, paragraphs, headings, figure numbering, captions, tables, citations, equations, quantities, comparisons, conditions, negation and uncertainty. Natural target-language syntax may differ; the scientific content and its qualifications must not.

Apply the [inline-English terminology rule](../paper-teach/references/terminology.md) to every important translated term occurrence, including repeats. Verified English names enable lookup and do not authorize additional author claims. Record genuine ambiguity separately in minimal translator notes when needed. Do not condense, reorganize the text as a research story, add invented headings, or expand it with teaching/background merely because narrative skills use those techniques.

Preserve source-like typography, columns, figure/caption groups and page boundaries where readable. Content fidelity takes precedence over forcing text into an identical box: retain all content and source locators rather than deleting material or shrinking it illegibly. Record actual layout deviations and map any continuation pages to their source pages. Batch by coherent page/paragraph/sentence ranges and save the precise next boundary.

## 3. Keep original graphics, visual translations and author captions together

Follow the figure-unit contract. Retain authentic unchanged source images; the main translated page uses the same scientific graphic with a faithful localized text/annotation layer where needed. Keep original graphics available in the retained original/parallel source view rather than automatically printing two full copies in the main layout. Translate readable in-figure labels without altering scientific identifiers, data, geometry, units, color meanings or panel identity. Inspect actual images and mark illegible labels instead of guessing them.

Translate the complete original author caption/figure legend, retaining its panel order, factual content and confidence, and place it with the matching image at the source-associated page/location. Caption translation is the requested figure explanation. Do not add a reader's guide, purpose/result summary, inferred conclusion, new methodological explanation or full figure-teaching workflow. Consult necessary source context only to resolve translation accurately; any indispensable translator note is clearly separate from author text.

## 4. Verify, save and distinguish completion

Verify source-to-target text coverage, figure identity, visual text/captions, actual rendered legibility and asset links. Save alignment, settings/source versions, exact page/sentence continuation, minimal translation notes and progress.translation.figureUnits through paper-memory. That figure record tracks original/localized assets, label coverage, caption status, presentation and verification/gaps; it does not require a newly authored explanation or advance progress.figures/detail/simple.

For an existing text-only translation, retain valid paragraph work and add missing figure components. Preserve prior outputs/revisions; do not treat old text-only completion as completion under the image-aware contract. Language changes invalidate affected localized text/views/captions while retaining authentic originals. Complete means faithful, traceable and verified requested content; unresolved units remain partial. Translation completion never proves full-paper teaching or automatically begins it.
