# Startup Settings

Read when a primary paper has no confirmed settings, settings are incomplete, or the user requests a change. Settings belong to one paper session, not reusable skill files. All four entries use this protocol; no fifth start entry is introduced.

## Questions and defaults

Ask, using the user's current conversation language:

1. **Which language should the translated document and subsequent explanations/questions use?** Record a precise language tag and name, including script or regional variant where it matters. There is no inferred language default.
2. **Would you like a full translation of the entire paper?** Default: **Yes**. Offer Yes first/preselected when the question tool supports it, but do not treat a preselected UI option as a submitted answer.

Accept answers already explicit in the request instead of asking again. A saved confirmed session resumes without repeating setup. A new primary paper asks again unless the user explicitly instructs reuse. If the user responds with a language while leaving the optional full-translation preference unspecified, apply the user's authorized Yes default, record its origin as default, and state it briefly; do not infer a language from non-response. If the user chooses No, ask/retain the language for interaction even though no full translated document is produced.

Only ask additional questions when a missing choice materially affects the task. Source language is normally detected, segmented teaching is the default, and files use the current workspace; these do not require an onboarding interview. A separate interaction language may be saved if explicitly requested; otherwise it equals translationLanguage.

## Timing and independent work

At entry, inspect enough bibliographic context to identify the paper. Ask setup questions early or when the first language-dependent step approaches, while useful independent work proceeds: inventory, download, extraction quality, indexing, internal source reading, provisional expert selection, and research-model construction.

While required answers are missing, keep status pending and record pendingFields. Use the conversation language for brief setup/status messages. Do not generate a full translation, substantive teaching answer, or localized map in a guessed language. Waiting does not confirm unanswered settings. After the required choice and explicit/default preference are resolved, persist confirmed settings before language-dependent output and proceed without another approval request.

## Data

session.settings contains:

- status: pending or confirmed.
- translationLanguage and interactionLanguage: null while unknown, otherwise objects with tag and name; for example `{ "tag": "es", "name": "Spanish" }`. Do not hardcode Chinese or English.
- fullTranslation: boolean, initially true as the configured default; fullTranslationSource: default or explicit.
- pendingFields: missing required choices; an initially unanswered setup includes translationLanguage and fullTranslation until an explicit choice or the stated default is accepted as above.
- version: settings version, starting at 1; changeReason for later substantive changes.
- sourceLanguages: detected source-language tags; these do not decide target language.
- presentation: segmented by default or single when requested.
- confirmedAt: confirmation timestamp; null while pending.

The store's configure command requires a language and supports `--full-translation yes|no`; yes is the default. It saves both language objects and the preference in a new checkpoint. The command records supplied answers; running it is not a substitute for actually obtaining them.

## Language and preference changes

Record the user's request, increase settings.version, and preserve prior versions. Source IDs, node IDs, predicate IDs, and evidence do not change merely because the language changes. Update reader-facing terms, explanations, map text/labels/UI, and future output; retain English/original technical names where useful.

Save a new translation artifact/version or explicit migration rather than relabeling an existing document. Mark stale language-dependent outputs for regeneration. If fullTranslation changes to No, preserve existing documents but stop future full-document work unless requested; local passage translations remain available. Changing to Yes resumes the proper untranslated scope.

Map locale changes may require updated text widths and routes, but preserve existing node positions where feasible and apply explicit layout repair only when necessary. Save one localized display label per predicate ID and one evidence-status label per status; do not let separate edges invent synonyms.
