# Complete Paper Explanation

Read for paper-detail-explain's full-explanation mode, including new runs, rewrites, and continuation. The outcome is an accessible, continuous account of the entire paper, backed by a complete manuscript and recoverable delivery progress. Other narrative modes remain scoped to their callers.

Use [topic flow, motivation and pace](topic-flow.md) throughout. Both the saved manuscript and chat need readable small-topic headings, concrete reasons/stakes before new technical content, actual paper anchors and parenthetical required/optional labels for topics mainly from supporting sources. An older unstructured manuscript is not reusable unchanged merely because its scientific facts are current.

## A self-contained core, with optional personal connections

Write for a reader outside the field who has not read any earlier explanation. Establish an appropriate expert perspective from the paper and keep that perspective explicit. Use current sources, verified background and the research model to decide what must be taught; the chat's previous wording, question order and apparent familiarity do not define the core narrative.

For fixed paper/version, expert perspective, requested scope and language/presentation settings, history-rich and history-free runs should teach substantially the same research architecture, necessary definitions, prerequisite chain, substantive methods/calculations, evidence and limitations. This is content consistency, not a promise of identical prose or a rigid chapter template. Prior exposure does not authorize less explanation. An explicit user request to skip or focus on material remains authoritative.

Develop the source-to-topic crosswalk and core account before selecting personal connections. Existing source-grounded notes may help verify facts and locate sources, but old answers are not primary evidence or prose to transplant. Check every reused claim or example for fit with the present paper, model and argument. Reconstruct missing understanding from the sources if no teaching history exists; do not ask the reader to complete figure teaching or produce old chat records first. Missing scientific sources still require truthful partial scope.

Only when an actual relevant record exists may it support a history-based supplement, such as revisiting a particular question, correcting a prior misconception or comparing a previously used example. Put it after the related topic's core explanation is complete, identify it as an optional connection, restate the actual idea involved and explain why the connection helps here. Keep it proportionate; do not retell unrelated prior lessons. Never imply remembered discussion without a record. Source-based background required for understanding belongs in the core, even if a previous conversation also covered it.

Supplements must be removable without breaking the argument, removing a definition, or leaving unexplained references. In each run record coreCoverage through the source crosswalk, and supplements separately with their record basis, relevance and placement. A reader can follow the complete core without opening old chats, the glossary, a map, or another teaching run.

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

An existing complete, source-verified, self-contained manuscript can supply this artifact when its source versions, expert perspective, language, requested scope and current teaching/terminology requirements still match. Reuse it coherently after checking fit and affected content; for a new run, copy the matching manuscript and crosswalk into its run folder and record the new opening/delivery intent without relabeling old chapters as newly delivered. Rebuilding unchanged chapters adds latency without improving coverage. Requested rewrites, known confusion, missing substance or changed evidence require revision; partial outlines and context-dependent old answers are not reusable complete manuscripts. The independence and completeness reviews below still apply.

This requirement does not mean dumping the complete manuscript into the first chat response. Single delivery presents it as one account when feasible; segmented delivery follows its chapters. If missing source material prevents a complete manuscript, clearly name the missing scope and provide a supported partial artifact without claiming readiness or completion for the entire paper.

Revise the manuscript when questions reveal an unclear premise or an error. Propagate corrections through terms, claims, source crosswalks, dependent chapters, and important map content. Preserve history rather than replacing prior delivery records with a fiction that the corrected content was already explained.

## Teach dependencies inside the narrative

Introduce background when it enables the next inference, not as an unrelated textbook preface. Before relying on a technical term, explain its selected-language/original name and concrete role in this study. State what the entities, measured quantities, states, or comparison objects actually are; avoid an unexplained "signal," "model," or "score."

Laying groundwork introduces the objects, problem and prerequisites needed for a later full explanation. It does not justify replacing that full explanation with a slogan or transplanting an old analogy into a different argument. Teach the central model, operation or inference completely where the narrative reaches it; reuse the groundwork to make its steps understandable.

Use explicit contextual recall at consequential dependencies. Name the concept or result, restate the part needed now, and connect it to the current reasoning. For the fictional classifier example, "Precision is the fraction of positive calls that are correct; removing false positive calls can therefore improve it even when some real positives are missed" supports the next calculation. "As mentioned earlier, the score improves" supplies neither the quantity nor the reasoning. The first is a local explanation; the second is an unresolved pointer. Length follows what the inference needs, not a one-sentence recall quota.

Within the current narrative, brief recall can reinforce a concept already explained there. For material found only in earlier chats, provide the necessary explanation here first; a reference to that chat is optional afterward. Previously displayed figures, completion flags and claimed familiarity do not prove comprehension. Do not make the reader retrieve the intended referent from a pronoun, an old metaphor or a bare "as above."

When changing direction, give the reason in the argument: "To decide whether this apparent gain comes from the model rather than the evaluation setup, we now need to examine the comparison." This is a transition into substantive explanation, not a promise to explain an essential premise in another installment.

Use informative small-topic headings and short paragraphs to organize the explanation; lists may clarify parallel comparisons or calculation steps. Before each small topic's technical account, identify the unresolved question, why the topic is needed and the relevant source section/figure. Explain the concrete consequence of the gap rather than merely asserting importance. The body still reads as a connected story, with the result explaining the next question. A toy example must return to the actual study, and an analogy must not become its replacement.

## Make technical content usable on return to the source

Use paper-methods to connect purpose, objects, notation, operations, and interpretation. For a central equation or algorithm, identify inputs and outputs, define symbols and units, show the sequence of operations/important derivation, and explain why the operation addresses the research problem. Where arithmetic or state transitions matter, trace a small worked example through the steps and interpret the result. Label teaching values/structures as invented and distinguish them from reported data or exact source settings.

For a statistical analysis, explain the unit of observation, experimental/biological replicates, comparisons, assumptions, effect being estimated, uncertainty, and how the procedure leads to the paper's stated inference. Explain an important normalization, objective, test statistic, or multiple-comparison choice rather than stopping at the tool name or significance threshold. Do not infer an unreported formula, implementation step, independence assumption, or parameter value.

For proofs, connect definitions and assumptions to the proposition, justify the important inference steps, and explain scope or counterexamples. For nonmathematical methods, give the equivalent substantive account of materials, selection, operations, interpretation, and alternatives. Technical depth follows the actual contribution; no paper needs a fabricated computation to satisfy a template.

Cover concrete methods sufficiently to understand design, analysis, results, and reproducibility. Necessary preprocessing, exclusions, controls, parameters, procedural details, and software/data provenance cannot all be relegated to "see Methods." Routine catalog identifiers or repeated identical conditions may be compacted into a source-linked procedural note; a detail that could change an inference belongs in the explanation itself. If the source does not permit a step to be reconstructed, identify exactly what is unreported and its effect.

## Narrative runs and chapter boundaries

Restored memory informs the new explanation without automatically choosing its start. A new whole-paper request or a rewrite opens from the research context, even if figure teaching or an old detail run is complete. Continue an existing run only when continuation is requested or unambiguous in the conversation. A specified chapter/topic overrides a generic starting point. Ask only if unresolved ambiguity materially changes the scope.

Retain the saved single/segmented preference. Draft the complete argument, then deliver manageable chapters with visible small-topic headings. Usually one installment covers a coherent research step through about two to four small topics, with a few short paragraphs per topic; split longer methods or derivations into meaningful named steps. Preserve necessary depth in the manuscript rather than compressing away premises to meet this pacing guide. A sentence or definition does not automatically require its own installment, and a heading never forces a pause. Single delivery still uses readable headings and paragraphs across the requested whole.

At a continuation, state the live problem and explain the essential prerequisite sufficiently to follow the current chapter without finding an earlier message. A brief recap is enough only when it actually restores the entities and reasoning; otherwise explain the premise again. Continue the same research argument rather than importing unrelated material from other runs. End at a natural boundary with a concise synthesis and the question that logically follows. Do not replace the explanation with an administrative statement that a segment was completed. Save the boundary for recovery without presenting the cursor as the reader's understanding.

## Completion review

Before marking manuscript-ready or full explanation delivered, check their respective coverage against the actual source crosswalk:

- Could a non-specialist identify the study's objects, problem, prior approach, gap, and contribution without guessing undefined terms?
- With earlier chats unavailable and every personalized supplement removed, does the manuscript still explain the entire requested scope, including all prerequisites? For the same source/scope/profile/settings, would a run without teaching history retain substantially the same core breadth and technical depth?
- Does every substantive section and major result/argument have an explained location, including Methods/proofs and important supporting evidence? Are gaps explicit?
- Can the reader trace the important measurements, mathematical operations, algorithmic steps, or analytic choices to their inputs, assumptions, outputs, and interpretations?
- Does every recall state its actual referent, needed meaning/result and present relevance, rather than relying on "as mentioned earlier"? Does groundwork lead to a full explanation of the central mechanism/method instead of replacing it?
- Does every small topic have a useful heading and a lead explaining the concrete reason/stakes, current task and actual paper anchor before technical content? Are supporting-source topics labeled required/optional for a defensible reason, with the main argument intact if optional topics are skipped?
- Are the abstract's claims supported and qualified by the explained evidence, with a final synthesis of significance, tradeoffs, scope, limitations, and unknowns?
- Do manuscript-ready, chapters-delivered, and reader-understanding records match what was actually written, shown, or reported?

An overview, aligned translation, figure tour, outline, isolated background lesson, or saved cursor is not the complete explanation. Apply the review to observable content, not merely to fields asserting it exists.
