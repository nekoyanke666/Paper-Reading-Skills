# Relationship Meaning, Names, and Types

## Single authority

Canonical IDs, English labels, definitions, aliases, reverse aliases, symmetry, and markers come from assets/relation-registry.json. Consult it rather than inventing a new name for fluent prose. Save original wording in originalLabels. The same meaning, direction, and conditions retain the same predicate across paragraphs, entries, trees, and languages.

“Provides support,” “supports,” and “evidence for” normalize to supports. The graph locale supplies exactly one display label per predicate in the session language, while canonical English labels remain unchanged internally. A localized label is not a new type. Do not translate “associated with” into a causal “promotes.”

Version/hash-lock the registry. Routine explanation uses rather than edits existing meanings. Necessary registry revisions require a new version, explicit migration, and before/after mapping; silently changing a label must not alter old semantics.

## Decision order

1. State a checkable proposition: who relates to whom, how, and under what conditions.
2. Identify its level: reading context, methods/observation, evidence/claim, mechanism, logic, structure/classification, association, or sequence.
3. Select the most precise registered meaning allowed by the evidence; synonyms reuse IDs, but similar words do not justify semantic merging.
4. Confirm direction/symmetry and reverse formulations; normalize endpoints, not only names.
5. Store evidence state, conditions/assumptions/population/time/aspect, source, and explanation separately.
6. Check tree focus, normalized type count, and readability; split meaningfully if needed.

## Distinctions that matter

- Evidence → supports → claim is not A → causes → B.
- Positive association or temporal precedence does not establish promotion/causality.
- Increased activity, activation, and increased expression may be different target aspects. Check interventions and measurements rather than merging every increase.
- Inhibition is a negative effect (T marker); hypothesis is a support state (dashes). They can coexist.
- Empirical support is not formal proof; necessity and sufficiency remain distinct.
- Composition (part_of) differs from classification (is_a); contains is the reverse of part_of.
- Not excluded is not supported; lack of significance is not refutation; alternative explanations need not be mutually exclusive.

## Direction, conditions, and deduplication

supports points from evidence to claim; tests from operation to tested question; causes/promotes/inhibits from cause to affected object; entails from premise to conclusion. ID/label/direction disagreement requires source checking, not normalization guessing.

Use stable condition/assumption IDs or explicit values in qualifiers; vague “normally” must not conceal scope differences. Same endpoints, predicate, and qualifiers form one edge with combined sources. Symmetric A–B and B–A deduplicate. Directed A→B and B→A feedback and different conditions remain distinct.

## Evidence states

Use supported, hypothesis, unresolved, inferred, design, disputed, or user explicitly. design describes research/reading design; it does not bypass causal/logical assessment. Supported/inferred/disputed claims need traceable sources. Supported causal relations need causalBasis, proofs/entailment proofBasis, and necessity/sufficiency inferenceBasis. These are reader-facing basis summaries, not hidden reasoning or proof that the interpretation is correct merely because fields exist.

Insufficient evidence remains hypothesis or an open question. Update support state/history on the same semantic edge rather than adding a more assertive duplicate to conceal the old claim.

## New types

Check existing meanings, synonyms/reverses, qualifiers, and whether the topic needs a separate tree first. Only then add an x: ID with precise definition, direction/symmetry, distinction from the nearest registered type, positive/negative examples, canonical label, aliases, reason, and localized display. Do not add a palette color.

Machines detect registered alias collisions and identical definitions, not every semantic paraphrase. The expert must compare meanings. Each tree has at most four normalized predicate IDs. Split by question using visible shared nodes rather than changing everything to association.
