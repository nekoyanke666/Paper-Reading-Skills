# Markdown and Mathematical Text

Read when authoring or upgrading sidebar content. The fixed implementation is assets/rich-text.js plus rich-text.css, with pinned local Marked and KaTeX assets under assets/vendor. This is presentation within the existing viewer, not a new tree type, editor or public skill.

## Supported content

Node detail/limits, glossary definitions/study roles/property values, relationship explanations/conditions/definitions and source notes can contain Markdown. Use paragraphs, headings, bold/emphasis, strikethrough, ordered/unordered lists, blockquotes, tables, inline code, fenced code blocks and links. Use formatting to make the full local explanation readable; it never replaces the independent explanation, study context or per-mention inline English names.

Canvas node names, tree titles, relation labels and property headings remain concise literal text under the locked label/geometry rules. Do not put a document heading, code fence or a long equation into a short graph label. Put substantive formatted material in the sidebar.

Use these math forms:

- Inline: `$x_i^2$` or `\(x_i^2\)`.
- Display: `$$\frac{a}{b}$$` or `\[\sum_{i=1}^n i\]`, including multiline content.
- An explicitly marked fenced `math` block renders as display math. Ordinary `text`, `latex` or other code fences and inline code remain literal source.
- Fractions, matrices, aligned equations, subscripts/superscripts and supported mathematical commands use [KaTeX syntax](https://katex.org/docs/supported.html). This is mathematical expression typesetting, not execution of a complete LaTeX document or package preamble.

Formula tokens are recognized before Markdown can reinterpret their underscores, asterisks or backslashes. Keep notation and source values faithful, explain symbols/units/assumptions and retain locators. Use `\$` for a literal dollar sign. Inside Markdown tables, use TeX commands such as `\lvert`/`\rvert` rather than unescaped column-separator pipes. Invalid or unsupported math retains readable source instead of becoming a blank explanation.

## Local rendering and content boundaries

The generated HTML embeds the libraries, full license notices, styles and WOFF2 fonts. Reading/rendering needs no CDN, remote equation service, extra server route or user-installed TeX distribution. The package records source versions, tarball integrity and individual asset hashes in vendor-lock.json; do not silently replace those files or remove their licenses.

Render supported Markdown through the fixed renderer. Raw HTML is escaped, Markdown images remain alternative text without fetching an image, and links accept HTTP/HTTPS, mailto and simple fragment destinations with safe attributes. Mathematical rendering uses trust=false, bounded expansion/size and a fresh macro scope for each formula. Do not enable executable HTML, trusted TeX commands, arbitrary embeds or global macros from imported/user text to imitate a missing feature. Code examples display source rather than run it.

The renderer caches unchanged content in bounded runtime memory. Formatting adds no persistent camera or graph state. Retain fixed sidebar width, palette and typography hierarchy; code, tables and display formulas can scroll horizontally within the sidebar rather than widen the page or shrink the graph.

## Saving and upgrading

Keep Markdown/TeX as the original string in existing model fields. Store backslashes correctly in JSON without double-escaping the text itself. Save/import/Prev/Next preserve those source strings; never replace them with generated HTML or serialized math markup. Archive formatVersion=1 and modelVersion=1 remain unchanged, and old history commits are not rewritten. A newer viewer can format the unchanged text of an older version without changing that version's stored data.

Follow the existing technical-refresh process for older entries: update the generated viewer in place, protect unsaved drafts and retain history/current.json and prior records. Installing a skill does not rewrite an already-open page's JavaScript. Reopen safely after the technical refresh. Keep source-based node identity and content updates separate from a viewer-only formatting upgrade.

## Verification

Check prose formatting, code and literal dollars, all four delimiter forms, fractions/matrices/aligned expressions, unsupported-command fallback, raw HTML/URL handling, isolated macros and source-preserving history round trips. Drive the compiled sidebar as well as the renderer module. Preserve existing camera-return, selection, tree/detail navigation, save/import and geometry regressions. Verify embedded font URLs and locked dependency hashes during template compilation. Distinguish string/minimal-DOM checks from actual desktop/mobile typography and overflow testing; report browser checks as unperformed when they were not run.
