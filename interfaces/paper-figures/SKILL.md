---
name: paper-figures
description: Internal interface. Inspect and display original figures for complete or local explanation, using captions and necessary methods to explain panels, observations, inference, and limits and select essential supporting figures.
---

# Paper Figures

Input: requested figures, original images/captions/methods, context, and shared terminology. Output: source-followable explanation in the session language, evidence locations, supporting-figure choices, and panel-level progress. Follow paper-teach and paper-evidence.

## 1. Inspect and display the actual figure

For full guidance follow main-figure number and panel order. For local questions handle the specified figure and necessary related evidence. Inspect the image, caption, and needed methods before displaying the figure/panel with its identifier. Preserve access to the full figure when enlarging a panel and link to source/aligned-translation identifiers when available.

State when only text is available or the image is unreadable. Do not infer unseen axes, colors, or markers from the caption. Label visual estimates as estimates, not exact underlying data.

## 2. Establish purpose and prerequisites

Explain the whole figure's question, the preceding gap it addresses, and why this method was used. Supply only background necessary for the current figure, new terms, and relevant prior concepts rather than expanding prerequisites into a course on the field.

For empirical figures cover objects, interventions, measurements, and comparison. For algorithms, models, theoretical diagrams, proofs, or qualitative materials, explain their actual structure without inventing experimental groups, sample sizes, or error bars.

## 3. Read each panel and its evidence

Explain as applicable:

- The experiment/analysis question, study object, intervention, and measurement.
- How groups and controls compare and what the control establishes, or the non-experimental comparison/reasoning baseline.
- Axes, units, colors, symbols, legends, and panel organization.
- Actual observations or analytical results and how they support the relevant conclusion.
- What the result does not establish and which other explanations remain reasonable.

When interpretation depends on them, explain sample size, replicates, error bars, and statistical methods. Statistical significance alone is not a complete explanation.

For deeper methods, statistics, equations, or proof, call [paper-methods](../paper-methods/SKILL.md) and return to the figure. If a conclusion depends on several figures, check them rather than assigning the full mechanism to one panel.

## 4. Integrate panels and supporting evidence

State the whole figure's purpose first, explain panels in order, then synthesize their joint conclusion, connection to the previous figure, and next question.

Inspect supplements and Extended Data first. Normally do not explain every supporting figure, but discuss key controls, validation, or limitations beside the relevant main figure when they materially change its interpretation or the main conclusion. Explain why the supporting evidence is necessary.

## 5. Return results and progress

Return figures/panels explained, image/source locations, key observations, supported scope, unknowns, and illegible items to the caller for saving. Completion requires substantive reading, evidence, limits, and connections within the requested range; local completion does not imply full-paper figure completion.
