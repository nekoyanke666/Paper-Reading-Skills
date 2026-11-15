# Full-Explanation Behavior Review

Version 1.1.1 corrects a demonstrated failure: a sequence of isolated short lessons and a restored teaching cursor could satisfy apparent progress without giving the reader a complete connected explanation. These are semantic review cases, not automated text-matching tests or an independent execution evaluation.

## Shared fictional source

Use only these invented source facts when reviewing the explanation contract. They are not evidence about any published paper.

- Abstract: a conservative classifier improves precision at a recall cost on a small labeled dataset.
- Introduction: two classes can share features. A permissive rule forces ambiguous cases into the positive class; the study asks whether abstaining from weak assignments reduces false positives.
- Methods: compare two rules on the same twenty objects, ten reference positives and ten reference negatives. The new rule requires two agreeing features before a positive assignment; otherwise it makes no positive call. Precision = TP/(TP+FP); recall = TP/(TP+FN). An uncalled reference positive is counted as FN for this reported evaluation.
- Results: old rule TP=8, FP=4, FN=2, TN=6; new rule TP=7, FP=1, FN=3, TN=9. Four formerly positive calls are removed: three false and one true. All counts are fictional.
- Discussion: the conservative rule exchanges coverage of positives for cleaner positive calls; this single dataset does not establish general superiority or robustness elsewhere.

## Cases and expected observable outcomes

1. **New full explanation with old progress.** Session has confirmed language, segmented presentation, completed figure guidance, and an old detail cursor at statistical evaluation. User asks, "Use paper-detail-explain to explain the entire paper coherently." Restore sources/settings; start a new narrative from research context, retain old history, and build the complete manuscript. Do not open by resuming statistics or skip the shared-feature problem because it appeared in figures.
2. **Explicit continuation.** The current narrative has a complete saved manuscript and has delivered the model/design chapter. User says, "Continue." Recall briefly why ambiguity motivated abstention, then deliver the next substantial chapter from the same run. Do not restart the whole paper or stop after defining TP.
3. **Rewrite after fragmented teaching.** User says, "These short sections are not the full explanation I wanted; tell the whole research story." Build a replacement connected manuscript with source crosswalk and a new run. Do not merely lengthen the next cursor-based lesson or mark prior notes as complete manuscript coverage.
4. **Specific local question.** User asks only, "Why did precision rise while recall fell?" Explain removal of three false calls and one true call, calculate both metrics, and connect them to the decision rule. Keep the full narrative position unchanged unless its content was actually delivered. This is not permission to start a new complete lecture.
5. **Single delivery and technical intelligibility.** User requests the entire account in one delivery. Explain the objects, ambiguity, motivation, rule, evaluation, calculations, results, and limits in connected prose. Trace old precision 8/12 to about 66.7%, new precision 7/8 to 87.5%, and recall 8/10 to 7/10 (80% to 70%). State the precision increase as about 20.8 percentage points, not 20.8% relative improvement. The result is a tradeoff under the specified evaluation, not proof of universal superiority.
6. **Missing methods.** Only abstract/results are available. Seek the missing source; if unavailable, explain the effect and offer explicitly partial guidance. Do not invent the two-feature rule or call a summary a complete reader guide.
7. **Manuscript versus delivery.** All chapters are written but only the opening was shown in segmented chat. Record manuscript-ready independently of chapters-delivered; do not record that the reader understands all chapters. Conversely, an outline listing all sections cannot be manuscript-ready.

## Review result and limits

The revised instructions were reviewed against these branches. Entry intent is owned by paper-detail-explain; connected content and completion by paper-narrative's full-explanation contract; recall by paper-teach; calculations by paper-methods; and independent manuscript/delivery/run records by paper-memory. This checks consistency of the written workflow. It is not a claim that a live model has independently executed all cases or that a real paper's teaching quality was tested. Structural validators cover package integrity separately.
