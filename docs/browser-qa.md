# Browser QA for Version 1.1.0

Date: 2026-11-15. Browser: Chrome on Windows. Content: fictional theory and mechanism fixtures only. This is separate from automated package validation and does not evaluate real-paper teaching quality.

## Observed

- At 1440 by 900 and 1024 by 768, the theory fixture displayed concept rectangles, method ellipses, named-object circles, proposition hexagons, smooth labeled curves, and the compact layout menu. Names remained readable without extra node subtitles.
- At 390 by 844, the minimal controls and layout popover remained accessible; the graph supported horizontal navigation. Clicking a named-object node opened the narrow-screen detail panel with its definition, evidence, visual role, limits, and connections.
- A native pointer drag moved a mechanism node with live edge changes and an unsaved indicator. Explicit save followed by reload restored the observed position. Default view restored canonical coordinates. Straight mode produced single M L paths; curves produced M C paths.
- Searching for an intermediate lemma located the existing node in its secondary tree and opened its sidebar. Shared-node membership controls and source/relationship details remained available.
- Initial testing exposed pointer capture swallowing ordinary node clicks. Capture now starts only after the drag threshold; subsequent normal-click testing opened the sidebar successfully. A minimal-DOM regression checks the click/drag distinction as well.
- Temporary viewport overrides were reset after testing. A screenshot of the four-role template with the layout menu was saved as a release artifact outside the repository.

## Scope limits

Cancellation, collision rollback, storage failure, shared-view placement isolation, source-update reconciliation, and keyboard handler behavior have automated runtime coverage. Actual touch hardware, assistive technology, and every possible graph/drag arrangement were not tested. Browser-local saved placements are separate from deterministic canonical snapshots. The supplied private RNA paper was reviewed through its saved source corpus and passed structural/geometry checks; its actual browser rendering was not tested.
