# Browser QA

## Version 1.3.0 files, independent detail trees and camera

Date: 2026-11-16. Chrome on Windows; fictional detail-workflow and theory fixtures only. The final viewer is paper-map-ui-1.5.0. Earlier observations below describe their historical versions, not the current save/default behavior.

- At 1440 by 900, 1024 by 768, and 390 by 844, the canvas occupied the remaining viewport below the controls with outer margins; no horizontal document overflow was observed. Tree selection and history import remained configured for a one-tree document. Mobile history and zoom/Center controls stayed within the viewport.
- Background pointer drag translated the board by the observed screen displacement. The wheel and +/- changed scale; Center restored the current tree's fit. After manual zoom at mobile width, resizing to 1024 and then 1440 refit the graph automatically (observed 26% to 62% to 77%). Opening/closing a sidebar also reframed the available canvas. It did not change node world positions.
- Low, Medium and High displayed the independently curated 3, 5 and 8 nodes. Shared-node memberships linked the same global definition between modes, with independent coordinates. The low-only question did not appear automatically in High. No automatic path collapse was used.
- The history popover placed Prev before Next on the first row and Save below, confirmed with actual element rectangles at desktop and mobile widths. A click still opened a node sidebar. At 80% scale, a 48-pixel pointer drag moved a node by 60 world units; three Alt+Left actions restored its original world position and cleared the unsaved state.
- Earlier in this release's browser check, created a node and a new tree, moved its node from (400,220) to (420,220), and downloaded a full archive. The actual 27,665-byte downloaded file parsed successfully, contained two saved versions and the new content/position. Prev removed the newly created tree from the view; Next restored it. This occurred before the camera addition; the final runtime suites check the combined behavior and signed coordinates.
- Actual browser upload was blocked by the extension's file-access permission. The permission was not changed and no alternate route was used. Native writable-file picker/write/close was not verified. Mock file tests cover successful close, cancellation, write/close failures and external-file conflicts; core/minimal-DOM tests cover all-version verification, cross-paper import and corrupt-input isolation. A real download is evidence for the download path, not native writable-file or browser upload success.
- Temporary viewport overrides were reset. The release screenshot is distributed outside the skill source. This check did not rebuild or assess the user's private paper map or academic interpretation.

## Version 1.1.0 checks

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

## Version 1.2.0 topic-catalog checks

Date: 2026-11-16. Chrome on Windows, fictional terminology fixture only. At 1440 by 900, 1024 by 768, and 390 by 844, observed a rootless view with no edges, global search by a glossary alias/property, definition/study-role/property sidebars, one-to-many edges, and same-node navigation back to the main argument. The all-relations control is absent in zero-edge views. Edge accessibility descriptions include the concrete endpoints and paper-specific meaning. Repeated source references in the property panel were consolidated without losing their property scopes.

Observed responsive issues were corrected: the opened sidebar could compress a medium-width title, and phone controls could leave the search field too narrow. Medium-width open-detail headers now wrap the title, and phone tree selectors occupy their own row with a readable search field beneath. Temporary viewport overrides were reset. A screenshot of the final branching/property view is a release artifact outside the repository.

New catalog tests also cover rootlessness, provenance, shared definition updates, aliases, sparse connectivity exceptions, and glossary-only persistence. They do not measure real-paper concept coverage. No existing private paper was rebuilt or evaluated for completeness in this release.
