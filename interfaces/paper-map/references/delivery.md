# Stable Entry, Update Review, and Link Delivery

## Prepare the entry by default

paper-prepare creates or restores a usable entry once the primary paper and interaction language are confirmed. Do not require a separate map request or wait for translation/full teaching. Use one stable location, such as `outputs/papers/<paper-id>/map/index.html`, and save its workspace-relative entryPath in session.progress.map. Keep generated artifacts in the workspace, not the installed skill.

Use source-backed content only. A partial model can start with a provisional research-question root, or an identifiable paper root if the question is still unknown, and no edges. Clearly explain partial scope in the sidebar. A minimal tree is valid; no placeholder findings or invented relationships are needed. Replacing a provisional root follows identity/lifecycle rules and retains history.

Language settings and normal structural/locale/render checks still apply. If language is unanswered or generation fails, record the pending step and specific blocker; do not present a planned path as an existing artifact. Continue independent preparation. Fix or retry the saved pending step when the blocker clears.

If another entry is invoked directly without a saved map, create this same minimal entry without restarting all preparation. Never create a separate entry merely because the conversation or reading stage changed.

## Evaluate on every invocation

All four public entries assess the work's effect on important concepts, evidence, relationships, support, scope, corrections, or significant unknowns. Longer guidance also reviews after each complete topic. Record the invoking entry, basedOnRevision, changed, and a concise reason in progress.map.review. A review is mandatory; a mutation is conditional.

If nothing important changed, preserve graph identities, positions, map revision, and rendered files. Review bookkeeping can use a normal memory checkpoint without forcing a graph rewrite. A missing/broken entry can be restored from saved graph state independently of a semantic change.

## Deliver the first link promptly

As soon as an entry exists and required checks succeed, include a clickable link in the current response. If preparation continues in batches, give it in the next available response rather than withholding it until all preparation finishes. Resolve a local entry to an absolute file link supported by the host. A local artifact does not require or imply external hosting/publication.

Save lastSuccessfulRenderRevision and a delivery record in progress.map. In a new conversation sharing this paper, provide the same saved link once when the entry is first used there; use a host conversation ID when available. A global delivered flag must not suppress delivery to another conversation. If the conversation cannot be identified, use visible context or provide the existing link once when uncertain; do not invent a chat ID.

## Reuse after updates

Render successful updates to the same entry location and briefly describe material changes in the response. Do not routinely repeat the link when it is already available in this conversation. Repeat it when requested, first used in a new conversation, previously undelivered, or changed/recovered after a broken path. If the location must change, update saved entryPath and provide the new link explicitly.

Record delivery in a subsequent bookkeeping checkpoint if needed; it is not a semantic graph update and does not require rerendering merely to match that metadata revision. lastSuccessfulRenderRevision continues to identify the actual rendered snapshot. On failure, retain and identify the last working entry, report stale/pending state, and avoid claiming the failed update is visible.
