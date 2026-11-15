# Complete Paper Explanation

Read for paper-detail-explain's full-explanation mode, including new runs, rewrites, and continuation. The outcome is an accessible, continuous account of the entire paper, backed by a complete manuscript and recoverable delivery progress. Other narrative modes remain scoped to their callers.

## Research narrative and breadth

First understand the actual paper as a whole. Build a crosswalk from every substantive source section and central claim to where the explanation teaches it. Include material presented outside the main results: methods/proofs, relevant captions, qualifications, and essential supplemental controls. A source section can be distributed across several narrative chapters; prose order is chosen for comprehension rather than copied from publication order.

The explanation should let a reader follow this connected development, adapted to the discipline rather than imposed as headings:

- What the objects and task are, what the field could already do, and why the remaining gap matters.
- What observations, limitations, or unresolved questions motivate this study; distinguish documented motivations from explanatory reconstruction.
- Why an existing approach cannot simply solve the problem and what requirements a solution must meet.
- What the proposed representation, argument, model, method, or design changes, and why those changes might help.
- How its substantive steps operate, what assumptions and choices they require, and how evidence or deductions are obtained.
- What each major result shows, what comparison/argument makes it informative, and how it changes the next question.
- How the results fit together, what the abstract and discussion can reasonably claim, and what remains unresolved or outside scope.

Tell this as a logical explanation, not invented discovery chronology, author impersonation, or a dramatic story whose neatness hides weak evidence. Distinguish direct observation/computation, author interpretation, background, and teaching inference. Preserve the actual paper's surprises, tradeoffs, negative results, competing explanations, and uncertainty.

## The manuscript is the primary artifact

Create a complete reader-facing manuscript at output/explanations/detail/<run-id>/manuscript.md in the saved interaction language before presenting its first chapter as part of a complete run. It contains substantive explanations of all planned chapters, technical reasoning/examples, source locators, and final synthesis, not placeholders for work to be understood later. Verify it against the whole-paper model and source crosswalk. Link it once usable so the reader can read the connected whole independently of chat pacing.

This requirement does not mean dumping the complete manuscript into the first chat response. Single delivery presents it as one account when feasible; segmented delivery follows its chapters. If missing source material prevents a complete manuscript, clearly name the missing scope and provide a supported partial artifact without claiming readiness or completion for the entire paper.

Revise the manuscript when questions reveal an unclear premise or an error. Propagate corrections through terms, claims, source crosswalks, dependent chapters, and important map content. Preserve history rather than replacing prior delivery records with a fiction that the corrected content was already explained.

## Teach dependencies inside the narrative

Introduce background when it enables the next inference, not as an unrelated textbook preface. Before relying on a technical term, explain its selected-language/original name and concrete role in this study. State what the entities, measured quantities, states, or comparison objects actually are; avoid an unexplained "signal," "model," or "score."

Use brief contextual recall at consequential dependencies. For example, when a shared measurement enters a later calculation, remind the reader why its source was ambiguous and explain how the new model handles that ambiguity. Later recall should add the relationship now needed, not mechanically repeat a glossary. Previously displayed figures or completed figure teaching do not prove comprehension.

When changing direction, give the reason in the argument: "To decide whether this apparent gain comes from the model rather than the evaluation setup, we now need to examine the comparison." This is a transition into substantive explanation, not a promise to explain an essential premise in another installment.

Headings may organize long text, and lists may clarify parallel comparisons or calculation steps. The body should still read as a connected explanation; do not make a succession of short numbered answers the default narrative structure. A toy example must return to the actual study, and an analogy must not become its replacement.

## Make technical content usable on return to the source

Use paper-methods to connect purpose, objects, notation, operations, and interpretation. For a central equation or algorithm, identify inputs and outputs, define symbols and units, show the sequence of operations/important derivation, and explain why the operation addresses the research problem. Where arithmetic or state transitions matter, trace a small worked example through the steps and interpret the result. Label teaching values/structures as invented and distinguish them from reported data or exact source settings.

For a statistical analysis, explain the unit of observation, experimental/biological replicates, comparisons, assumptions, effect being estimated, uncertainty, and how the procedure leads to the paper's stated inference. Explain an important normalization, objective, test statistic, or multiple-comparison choice rather than stopping at the tool name or significance threshold. Do not infer an unreported formula, implementation step, independence assumption, or parameter value.

For proofs, connect definitions and assumptions to the proposition, justify the important inference steps, and explain scope or counterexamples. For nonmathematical methods, give the equivalent substantive account of materials, selection, operations, interpretation, and alternatives. Technical depth follows the actual contribution; no paper needs a fabricated computation to satisfy a template.

Cover concrete methods sufficiently to understand design, analysis, results, and reproducibility. Necessary preprocessing, exclusions, controls, parameters, procedural details, and software/data provenance cannot all be relegated to "see Methods." Routine catalog identifiers or repeated identical conditions may be compacted into a source-linked procedural note; a detail that could change an inference belongs in the explanation itself. If the source does not permit a step to be reconstructed, identify exactly what is unreported and its effect.

## Narrative runs and chapter boundaries

Restored memory informs the new explanation without automatically choosing its start. A new whole-paper request or a rewrite opens from the research context, even if figure teaching or an old detail run is complete. Continue an existing run only when continuation is requested or unambiguous in the conversation. A specified chapter/topic overrides a generic starting point. Ask only if unresolved ambiguity materially changes the scope.

Retain the saved presentation preference. For segmented delivery, choose substantial chapters after drafting the whole argument. A chapter should resolve a meaningful stage of understanding with its needed prerequisites, reasoning, and evidence; a sentence, a figure panel, or an isolated definition does not automatically merit a separate installment. Chapters may each contain several concepts, methods, or figures. No fixed topic count or mandatory per-subheading pause applies.

At a continuation, use a few sentences to restore the live problem and essential previous idea, then carry the narrative forward. End at a natural boundary with a concise synthesis and the question that logically follows. Do not replace the explanation with an administrative statement that a segment was completed. Save the boundary for recovery without presenting the cursor as the reader's understanding.

## Completion review

Before marking manuscript-ready or full explanation delivered, check their respective coverage against the actual source crosswalk:

- Could a non-specialist identify the study's objects, problem, prior approach, gap, and contribution without guessing undefined terms?
- Does every substantive section and major result/argument have an explained location, including Methods/proofs and important supporting evidence? Are gaps explicit?
- Can the reader trace the important measurements, mathematical operations, algorithmic steps, or analytic choices to their inputs, assumptions, outputs, and interpretations?
- Do necessary recall and transitions make the dependency chain understandable instead of leaving disconnected facts or deferred prerequisites?
- Are the abstract's claims supported and qualified by the explained evidence, with a final synthesis of significance, tradeoffs, scope, limitations, and unknowns?
- Do manuscript-ready, chapters-delivered, and reader-understanding records match what was actually written, shown, or reported?

An overview, aligned translation, figure tour, outline, isolated background lesson, or saved cursor is not the complete explanation. Apply the review to observable content, not merely to fields asserting it exists.
