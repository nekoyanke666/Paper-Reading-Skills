# Optional Operational Helpers

The expert decides content, identity, relationships, and view scope first; helpers normalize and check those decisions. Run these commands from paper-map. Sessions/output belong in the user's workspace, not the installed skill.

## Registry and candidates

`python scripts/map_ctl.py relation --token "provides support"`

Returns canonical ID/label/definition and endpoint reversal; similar words do not establish causality.

`python scripts/map_ctl.py normalize --session candidate.json --output normalized.json`

Creates a candidate with canonical relations and checked geometry without overwriting the canonical session. Explicitly migrate old broad relationship categories rather than guessing their meanings. Configure confirmed language settings first. Supply a complete graph.locale dictionary for non-English output.

## Patches

Common fields: expectedRevision, roleVersion, settingsVersion, reason, importance, semanticReview, operations. Importance includes core_concept, evidence_change, relation_change, correction, or unresolved_question. semanticReview provides concise identity/relation/scope notes.

- add_node: reuse identity or create, place in treeId near anchorId, optionally name a ref for `$name` references.
- update_node: change same-referent name/detail/sources/limits/status; retain old name as alias.
- reclassify_node: provide newType, reason, and evidence that referent is unchanged.
- add_link/update_link: normalize/deduplicate or update source/support state; changed meaning/endpoints/conditions require retire-and-add.
- add_tree/update_tree: focused-question title, shared nodes, justified root/title changes.
- attach_node/attach_link: reuse existing objects without copying IDs.
- remove_from_tree/detach_link: view-only change; root removal needs replacementRootId.
- merge_nodes: supply same-referent basis, keep target ID, reconnect and redirect.
- retire_link/retire_node: preserve reason/revision; explicitly handle incident edges/root first; refutation is not retirement.
- restore_link/restore_node: justify from retired history; merged IDs do not become independent again.
- archive_tree: not main; rehome unique important content first.
- move_node: requires allowLayoutRepair=true and a reason.

Locale/preference changes update the session settings and locale through a reviewed candidate, preserving prior versions. Normalize/check again because display widths may change. An ordinary semantic patch must match the current settingsVersion.

## Plan and commit

`python scripts/map_ctl.py plan --session paper-session.json --patch patch.json --output candidate.json`

Reports impact, refs, quality, and changed state without writing the canonical session on failure.

`python scripts/map_ctl.py apply --session paper-session.json --patch patch.json --output map-site`

After checks, paper-memory commits a revision and renders the matching site. No change means no revision/rewrite. This is an internal process, not a per-node approval flow.

## Rebuild and recover

`python scripts/map_ctl.py check --session paper-session.json`

`python scripts/map_ctl.py render --session paper-session.json --output map-site`

Render accepts only canonical data and the locked template and produces HTML, matching JSON, manifest, quality report, and immutable snapshots. If a commit succeeded but render failed, use render-pending.json to rerender the saved revision rather than applying the patch twice. If helpers are unavailable, preserve canonical data and follow the same rules while explicitly reporting unperformed checks.
