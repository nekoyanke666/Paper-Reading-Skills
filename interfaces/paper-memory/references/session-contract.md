# Single-Paper Session Contract

Canonical state: `work/papers/<paper-id>/paper-session.json`. Originals live in sources/ and location indexes/necessary extracts in corpus/. The full source is not represented only by a chat summary. Reusable skill files contain no mutable paper state.

## Fields

- schemaVersion=2 and integer revision; paper contains stable id, title, actual version, and principal identifiers.
- settings: pending/confirmed languages, fullTranslation (default true), preference provenance, settings version, detected source languages, presentation, and pending questions. See [startup settings](settings-contract.md).
- roleProfile: selected expertise, rationale, provisional/confirmed status, profile version, first announcement, and change reason.
- sources: stable IDs, primary/supplement/background/code/data roles, origin, local path, full-text availability, quality, and version. Located does not mean downloaded or read.
- coverage: each substantive section/essential attachment's id, sourceId, locator, kind, status, and note. Cover actual text, main figures/captions, methods/proofs/materials, and essential supporting evidence.
- readingModel: unbuilt/partial/verified status, inventoryComplete, requiredCoverageIds, researchQuestions, complete outline and conceptual dependencies, synthesis, and uncertainties. The outline maps to the whole source, not just the next lesson.
- glossary: original/English and target-language terms, optional studyRole and verified facets[{label,value,sourceRefs}], language tags, aliases, study-specific definition, prerequisites, sources, and revisions. Records are not a substitute for explanations or recall. Legacy en/zh fields may be imported explicitly but must not impose Chinese output.
- claims: id, statement, kind (observation/computation/proof/interpretation etc.), status, evidence[{sourceId, locator}], conditions, and limits. Unsupported hypotheses may be recorded but not marked established.
- progress: activeEntry, translation, figures, detail, returnTo, lastQuestion, and map. Keep ranges independent; skipped-by-preference is distinct from complete. map stores conceptCoverage (source-to-map items, importance, representation, nodes/links/views, gaps, and review status), stable entryPath, lastSuccessfulRenderRevision, review {entry, basedOnRevision, changed, reason}, and conversation-aware delivery records. See the [map delivery contract](../../paper-map/references/delivery.md).
- progress.detail: currentRunId and retained runs for separate narrative attempts. Each run records its requested scope/start intent, source/model version, complete plan/source crosswalk, manuscript path/version and coverage status, delivered chapter IDs/ranges, current/next boundary, known gaps, and reader-reported comprehension separately. Existing detail records may be imported without claiming an old outline or isolated chapter is a complete manuscript. These are teaching records, not a reason to change confirmed language/presentation settings.
- questions/corrections: unknowns and corrected statements with reasons, sources, and dependent claims/nodes.
- graph: global nodes/links, registered relation semantics, trees, and locale; null before a map exists.
- audit: checkpoint revision, timestamp, and concise reason; prior snapshots in .history/.

## Whole-paper readiness and recovery

Read the whole paper and essential material before integrated guidance. Verification requires a complete nonempty required inventory, available full text, checked required coverage with locators/notes, a complete outline/synthesis, traceable claims, and a confirmed expert profile. Store validation cannot prove the agent read or understood the source.

Use actual structure, never invented sections or not-applicable labels hiding missing material. Local questions can remain partial with explicit scope. Restore model/progress first, then retrieve current sources, evidence, terminology, and surrounding context. If memory cannot be read, explain rather than pretending continuity.

A new full-detail request begins a new connected narrative at its opening unless a different start is explicitly requested. Retain previous runs and terminology, but use a saved delivery cursor only for requested or unambiguous continuation. A complete manuscript and a fully delivered explanation have independent statuses; neither establishes reader understanding. See the [full-explanation contract](../../paper-narrative/references/full-explanation.md).

## Writes

session_store.py provides init, read, validate, checkpoint, and configure. A checkpoint needs the expected revision and a reason; it rejects stale/cross-paper overwrites, saves history, and atomically replaces JSON. Substantive expert and settings changes require a higher corresponding version and reason. Pending settings allow independent preparation, but language-dependent output requires confirmed settings.

Commit canonical memory before generating its matching map snapshot. Browser notes are user material, not source evidence, and cannot overwrite canonical memory silently. Export/review/merge them with provenance before upgrading status. Avoid double-committing a map update with a stale caller state.
