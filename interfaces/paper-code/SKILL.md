---
name: paper-code
description: Internal interface. Trace paper code, data processing, or figure generation against methods; set up execution or reproduction only within the requested task and distinguish code reading, running, and result verification.
---

# Paper Code

**The user's time is valuable.** Minimize unnecessary waiting: reuse valid work, load only relevant material, and avoid redundant steps while preserving the requested completeness, evidence checks and saved-state safety.

Input: analysis to understand/reproduce, repository/data, and paper version. Output: traceable input–processing–output explanation, source crosswalk, actual execution/verification scope, and gaps, in the session language.

## 1. Identify implementation and task

Follow paper-teach and paper-evidence. Confirm repository origin, version/commit, analysis, data, and paper version. Current repository contents need not match the publication's version; public code does not imply reproducibility.

Distinguish static understanding, running a specified analysis, and verifying paper results. A question about code meaning does not independently authorize expanding the task to reproduction.

## 2. Follow the actual data flow

Trace the specified analysis/figure from input through processing to output. Check preprocessing, parameters, models, statistics, and figure generation against methods. Explain equations, shapes, types, indexing, units, and small numerical examples as needed.

Separate original implementation, public current state, and newly written teaching examples. Examples are not the paper implementation. If prose and code disagree, identify locations, impact, and uncertainty.

## 3. Execute and verify within scope

When execution/reproduction is requested, check environment, data, weights, configuration, versions, compute, and expected outputs, then perform the necessary scope. Specify which step missing material affects. Downloading or reading is not execution.

After execution check actual inputs, outputs, comparison criteria, and deviations. A successful run is not automatically reproduction of published results. Report partial reproduction as partial and retain verifiable configuration and records.

## 4. Return the actual outcome

Return relevant files/lines, versions, input/output, source differences, run records, and incomplete items for paper-memory. Completion requires a clear transformation of data and an honest distinction between reading, execution, and verification.
