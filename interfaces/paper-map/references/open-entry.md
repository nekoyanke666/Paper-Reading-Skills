# Open and Reopen the Map

Read on first map delivery, an explicit open/reopen request, a stale local link, or a new conversation using an existing map. Opening is a host-navigation operation, not a new public skill or a reason to restart paper preparation.

## Resolve and restore

1. Restore the active paper and its workspace-relative entry/storage paths through paper-memory. Resolve them against the current workspace. Use the existing generated folder and history; do not allocate a new tree because a browser tab, port, chat or process changed.
2. Inspect this folder's .paper-map/service.json without printing its token. Check its loopback URL through /api/ping and confirm its root identity matches the current folder. Treat a saved URL as replaceable process metadata, not proof that the service is alive.
3. If the service stopped, start it yourself using the [local-storage contract](local-storage.md). Use an installed Node runtime; if it is not on PATH, discover a host-provided runtime when that capability exists. Do not guess a different user's runtime path or ask the reader to run a launcher when agent execution is available.
4. In hosts that terminate detached descendants, keep --serve in a retained process/tool session, wait for ready JSON, and verify it from a separate request. Reuse a healthy existing service instead of starting another. Update the saved URL/process metadata without changing the scientific map revision or reading position.

## Present the usable entry

Prefer the host's browser panel and a clearly labeled one-click web link. Use the map's direct checked HTTP URL with a short localized label, not an executable-file link that the host may display as text. In Codex, discover open_in_codex when available and use its browser target with the verified local URL, normally placement=right. Do not target another chat unless explicitly requested. A response with status=queued means the panel request is waiting for that chat/window to be shown; describe it as queued, not visibly opened. The tool opens UI; use browser observation separately if a rendered-state claim is needed.

If a browser-panel tool is unavailable, deliver the verified clickable local URL. Do not invent an app deep link, assume that clicking a .cmd executes it, or turn a static file preview into the primary Save-enabled entry. Do not require a new public opener skill; natural requests to open the existing map route through paper-ask and this interface.

The reader's normal action is a single click on a prominent, localized Open paper map link. Provide the live URL itself; do not require the reader to type a phrase, invoke a skill, copy a command or open a launcher first. The agent checks/restarts the service before presenting the link and uses the host panel when available. Explicit spoken/typed opening requests remain supported, but are not a prerequisite for the clickable entry. Keep open-map.cmd/open-map.sh as optional outside-app fallbacks, not the default instruction or a required step in Codex. If local execution is actually blocked or no runtime is available, identify that specific blocker and preserve the working artifact/history; offer the fallback only then or when requested.

A local link cannot restart a stopped process by itself. Recover the service before issuing a new link rather than promising permanent availability of an old port. Do not configure OS autostart, publish the site, change storage location, or add hooks as a side effect of opening it.

## Scope and completion

For an opening-only request, load the minimum saved context and perform navigation; do not ask translation/language setup again, choose a new expert, explain all figures, regenerate a healthy site or claim new scientific understanding. Record a no-change map review and any changed delivery/process metadata. For a mixed request, open the map, then apply the ordinary evidence/teaching rules to the content question.

When there is no clear active paper and several map folders could match, ask which paper while preserving the candidates. For a missing artifact, rebuild from the saved canonical paper model through normal checks; a dead service alone is not a missing model.

Completion means the resolved existing map has a verified live service plus a usable clickable URL, and any host panel request has been submitted with its actual status reported. Preserve its history, user-only zoom policy, current paper and interrupted reading progress.
