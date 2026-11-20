# Explain and Retain Technical Vocabulary

Read when figure teaching, full/concise explanation, or a question introduces or depends on technical vocabulary, or when an existing definition needs clarification. Apply the selected language and paper-evidence's source rules. This is shared teaching behavior, not another public entry.

## Explain where the term is used

Give the selected-language name, verified English name, plain definition and role in the current paper. Whenever an important translated concept or technical term is named, put its English name immediately beside it in the form `target-language term (English term)`. Preserve natural target-language punctuation; when emphasizing a term, use a paired form such as `**target-language term (English term)**`. English in a glossary, original paragraph, earlier message, caption or sidebar is not a substitute for the inline pairing.

Repeat the English name on **every occurrence** of the translated term, even when it has just appeared in the same sentence or paragraph. There is no first-use-only, once-per-answer, once-per-figure or once-per-session exception. Apply this to prose, headings, bold/key terms, lists, tables, figure/panel explanations, summaries, questions, recaps and translated quotations within detail/figure/ask/simple work. The rule also applies when full-paper translation was declined: explaining a term in translation still requires its English name. Do not remove later English names merely to make repetition look tidier or to shorten the output.

Use the paper's actual English expression, spelling and capitalization when available; keep one canonical mapping for the same referent and distinguish different English concepts that share a target-language rendering. For named methods, metrics, structures and emphasized domain concepts, retain enough of the English phrase to identify the actual object, not a vague one-word approximation. An acronym may accompany its English expansion, but a previous expansion does not justify substituting an unexplained abbreviation for the required English name on a later translated mention. Unchanged English names, symbols or English acronyms already identify their source forms and need no meaningless repetition such as `English name (English name)`. If the interaction language is English, write the English term directly rather than duplicating it.

For a non-English source, retain its original term as needed and add a verified standard English equivalent when available. Distinguish that equivalent from wording actually used by the source. If no English equivalent can be verified, retain the original and explicitly identify the unresolved English terminology rather than inventing a translation or quietly omitting the issue. This is an evidence gap, not a general exemption from pairing terms whose English names are known.

The obligation concerns important/domain concepts, including ones selected for bold emphasis; ordinary headings, complete emphasized sentences, numerical values and everyday connective language do not all require parallel English prose. Do not translate a whole bold sentence just because it is bold. Each important translated term inside it still receives its own adjacent English name. English labels enable lookup but do not replace the actual explanation.

Explain prerequisite terms before using them to define another term. On a later use, briefly recall the relevant meaning if the current reasoning depends on it; do not make the reader remember an earlier chat or open the map to understand the answer. The explanation can become briefer when appropriate; the repeated English-name requirement remains.

Include terms required to read the current paper: mechanisms, entities/classes, methods/materials, mathematical objects, notation, metrics, and analytic concepts. They may deserve a reusable definition even when they are not a main finding. Ordinary words, author/institution names, or incidental catalog identifiers do not automatically need nodes. Do not dump a whole dictionary before teaching the topic.

## Save one definition with useful context

Search the shared glossary and node aliases first. Reuse the ID for the same referent; distinguish homonyms, broader/narrower objects, and study-dependent meanings. Save the name/aliases, definition, original terminology, canonical English name, studyRole, sources, and any useful verified properties under the glossary term. For English-source papers sourceTerm can store the actual English name; for other source languages keep the original sourceTerm and save the verified English equivalent separately, using the existing english field when appropriate. Preserve the source basis for that choice. A node references it with termIds rather than maintaining a competing dictionary entry. Corrections update the shared definition and affected inline pairs; saved mappings support repetition but never make later English labels optional.

Before returning detail/figure/ask/simple output, review every named occurrence of important translated terminology, including repeats and bold text. Correct missing adjacent English names and inconsistent mappings. A glossary-only check or verifying just the first occurrence cannot satisfy this review. This is a content review, not a keyword count proving semantic correctness.

Write definitions as direct, independently understandable accounts of the actual concept. When retained in a tree, follow [complete node explanations](../../paper-map/references/node-explanations.md): do not save a clipped lecture sentence, an instruction to recall an earlier example, or a warning about a figure as the term's explanation. The expert-organized map and its sidebars remain understandable without the conversation that prompted them.

Choose contextual properties from the object and study, not a rigid form. Examples include:

- A mechanism: what changes, relevant participants/conditions, and why it matters here.
- A gene or gene class: the actual referent/classification, verified genomic location or relevant anatomical/cellular context, known function, and what the present study tests. Gene locus, tissue expression, and protein localization are different properties; do not conflate them or infer function merely from the name.
- A library/preparation type: selection/depletion principle, what input it enriches or retains, what measurement it enables, and important biases.
- A mathematical object, algorithm, or metric: definition, inputs/outputs or units, assumptions, interpretation, and use in this paper.

These examples adapt across disciplines. Do not invent a property to fill a field. Identify the precise missing or unreported fact when it affects understanding. Separately identify external background and paper-specific results; verify external facts through appropriate primary sources before using them.

## Maintain topic catalogs through paper-map

After a coherent explanation or answer, evaluate terminology retention alongside the main research map. Read paper-map's [topic-catalog contract](../../paper-map/references/topic-catalogs.md) when adding, organizing, or correcting reusable terms. Use topical views that may have no edges or only a few meaningful ones. Categories are inferred from the actual paper and accumulated vocabulary; biological mechanisms, genes/genomic regions, and library types are examples, not universal required views.

Reusing a term in multiple topics or the research narrative reuses the same global node. Keep visible shared membership and navigation, searchable names/aliases/definitions/properties, and detailed sidebars. Topic membership is metadata, never evidence of a biological, causal, or logical relationship. Do not create edges or synthetic category-root nodes merely to make a catalog look like a connected tree.

The caller saves terms and invokes paper-map once for the coherent update. Explain terms immediately in the text even if rendering is delayed or unavailable. Report actual catalog updates briefly and reuse the stable map link; do not replace the explanation with a link.
