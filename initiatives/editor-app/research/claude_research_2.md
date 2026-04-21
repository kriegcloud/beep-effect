# Tauri + React rich-text editors: no Lexical exists yet, but ProseMirror dominates

**No open-source repository combines Tauri + React + TypeScript + Lexical.** This niche is entirely unoccupied. The Tauri note-editor ecosystem overwhelmingly runs on ProseMirror and its wrappers (TipTap, Remirror, Milkdown), with zero projects using Effect-TS. However, several strong Tauri + React + TypeScript projects exist that could serve as architectural foundations — and the best path forward is likely combining patterns from two or three of them rather than forking any single repo.

---

## The six strongest candidates using Tauri + React + TypeScript

Every repository below meets the "must have" requirements of Tauri, React, and TypeScript. They differ in editor engine, storage layer, and maturity.

### 1. MarkFlowy — the most mature option

**URL:** https://github.com/drl990114/MarkFlowy | **~2,000 stars** | **Last release:** Sep 2025 (v0.34.1), active commits since  
**Stack:** Tauri v1 · React · TypeScript · **Remirror** (ProseMirror wrapper) · Zustand  
**Storage:** Local filesystem via Tauri FS API (plain Markdown files)  
**License:** AGPL-3.0

MarkFlowy is the highest-starred Tauri + React editor found. Its README explicitly states it "uses ProseMirror as its core editor," wrapped through Remirror for React integration. It offers dual editing modes (WYSIWYG + source code), built-in AI (DeepSeek, ChatGPT, Copilot), custom themes, Git management, drag-and-drop file tree, and i18n across five languages. The binary ships under **20 MB**.

**Gaps:** Still on Tauri v1 (a v2 migration issue exists but hasn't been acted on). No plugin architecture beyond Remirror's extension model. No Lexical. No Effect-TS. AGPL-3.0 may be restrictive depending on distribution plans.

### 2. mdSilo — feature-dense all-in-one knowledge base

**URL:** https://github.com/mdSilo/mdSilo-app | **~727 stars** | **Last active:** late 2024  
**Stack:** Tauri v1 · React · TypeScript · **ProseMirror** (direct, no wrapper) · CodeMirror v6 (source mode) · Zustand · immer · d3  
**Storage:** Local plain-text Markdown files  

mdSilo is the most feature-rich project in this survey: WYSIWYG editor, mind maps, Kanban boards, graph view, timeline view, RSS/Atom/Podcast reader, PDF/ePub annotation, wiki_links, hashtags, Mermaid/ECharts diagrams, LaTeX math, and chemical equations — all in one app. It uses ProseMirror directly (not via TipTap or Remirror), giving maximum control over the editor layer.

**Gaps:** Development has slowed (an open issue requesting Tauri v2 migration from Nov 2024 remains unresolved). The sheer breadth of features means the codebase is large and tightly coupled. No Lexical, no Effect-TS, no formal plugin architecture.

### 3. Gramax — Git-native docs-as-code editor

**URL:** https://github.com/Gram-ax/gramax | **511 stars** | **Actively developed**  
**Stack:** Tauri (likely v2) · React · TypeScript · **TipTap** (ProseMirror-based) · Rust backend  
**Storage:** Local Markdown files with **deep Git integration** (GitHub, GitLab, Bitbucket, Gitea)

Gramax takes a unique "docs-as-code" approach. Its visual TipTap editor writes Markdown that's version-controlled via Git natively — not as an add-on. It supports Mermaid diagrams, Excalidraw, diagrams.net, Swagger API descriptions, tables, video embeds, and 17 UI languages. It ships as both a Tauri desktop app and a browser version.

**Gaps:** Oriented toward documentation portals rather than personal note-taking. No wiki_links or graph views. No Lexical, no Effect-TS. The tight Git coupling may add complexity if you want simpler filesystem storage.

### 4. Typethings — cleanest monorepo architecture

**URL:** https://github.com/pheralb/typethings | **~61 stars** | **Active development**  
**Stack:** Tauri · React · TypeScript · **TipTap** (custom unstyled primitives) · Zustand · React Router v6 · Turborepo  
**Storage:** Local filesystem (Markdown files in workspace directories)

Typethings stands out for its **Turborepo monorepo** with well-separated packages: `@typethings/editor` (TipTap primitives), `@typethings/ui` (shadcn/ui + Tailwind), `@typethings/fs` (Tauri filesystem abstraction). This separation-of-concerns pattern is the cleanest of any project surveyed and would be the easiest to fork and extend. Features include CMD+K search, workspace management, syntax highlighting, and dark/light modes.

**Gaps:** Relatively early-stage with a smaller feature set. No wiki_links, graph views, or search indexing. No Lexical, no Effect-TS. Low star count suggests limited community testing.

### 5. WebNotes — best hybrid sync architecture

**URL:** https://github.com/aetosdios27/WebNotes | **24 stars** | **Active**  
**Stack:** Tauri · Next.js 15 · TypeScript · **TipTap** (headless, schema-based) · Zustand  
**Storage:** **SQLite** (desktop, local-first) + **PostgreSQL/Neon** (web, serverless sync)  
**License:** MIT

WebNotes is the only project with a **dual-runtime architecture**: a Tauri desktop client for deep work with SQLite local storage, and a Next.js web client syncing to PostgreSQL. Its block-based Notion-style editor supports bidirectional linking (`[[wikilinks]]`) and LaTeX math, claiming sub-10ms editor response times.

**Gaps:** Small project, limited testing. The Next.js dependency adds weight if you only need the desktop client. No Lexical, no Effect-TS.

### 6. Open Note — simplest starting point

**URL:** https://github.com/JeremiasVillane/open-note | **~2 stars**  
**Stack:** Tauri v1 · React · TypeScript · **TipTap** · Mantine · Zustand  
**Storage:** Local filesystem via Tauri FS API

A straightforward note-taking app with TipTap rich-text editing, note encryption, PDF export, and i18n. Its simplicity makes it the easiest codebase to read and understand, but it's essentially a starter template rather than a production app.

**Gaps:** Minimal features, very low adoption. No Lexical, no Effect-TS, no search, no wiki_links.

---

## Non-React projects worth studying for architecture

Three Svelte-based projects offer architectural patterns worth porting to a React implementation, even though they don't use React themselves.

**Otterly** (https://github.com/ajkdrag/otterly, 74 stars) uses Svelte 5 + Milkdown + Tauri v2 with **SQLite FTS5 + BM25 ranking** for full-text search. Its vault-based model (vault = folder, no proprietary database) closely mirrors Obsidian's approach. wiki_links with backlink/outlink tracking, an omnibar for universal search, and tab pinning round out the feature set. The Rust-side SQLite FTS5 search engine is its standout contribution.

**HelixNotes** (hosted on Codeberg, not GitHub) uses SvelteKit + TipTap v3 + Tauri v2 with **Tantivy** (a Rust-native full-text search engine comparable to Lucene) for instant search. It also includes a graph view, version history with diffs, automatic backups, Obsidian import, and AI tools. Released February 2026, it's the newest project surveyed.

**Moraya** (https://github.com/zouwei/moraya, 9 stars) uses Svelte 5 + Milkdown + Tauri v2 with the most sophisticated **service-based plugin architecture** found: file, AI, MCP protocol, voice, publish, plugin, and i18n services are all modular. Its layered IPC design — Svelte frontend → service/store layer → Tauri IPC → Rust backend — is a clean reference for building extensible desktop editors.

---

## Why Lexical is absent and what that means

The research uncovered a concrete explanation. **Outerbase** (later acquired by Cloudflare) evaluated both Monaco and Lexical for their Tauri-based database GUI and rejected both. Their engineering blog states: "After trying both Monaco & Lexical we found those solutions both too bulky and cumbersome. Monaco couldn't easily be wrapped in our Tauri app due to its use of web workers." They built a custom 21KB editor instead using Web Components + PrismJS.

**Liveblocks**, which spent months integrating Lexical for their collaborative editing platform, published a detailed assessment in early 2025 concluding: "Although Lexical has a large community and commercial backing, it needs more time to mature before we can recommend it over Tiptap." They cited three specific weaknesses: Lexical lacks pure decorations (decorator nodes mutate the document), its Yjs integration hardcodes root node names preventing multiple editors per document, and its examples rely on workarounds that wouldn't scale in production.

The only confirmed desktop app using Lexical is **Nimbalyst**, which runs on **Electron** (not Tauri) and is proprietary. A small `2do-txt` task manager (62 stars) is tagged with both `lexical` and `tauri` on GitHub but uses Capacitor as its primary runtime. The Lexical desktop ecosystem is effectively empty.

This doesn't rule out Lexical for a new Tauri project — Lexical's framework-agnostic core and immutable state model are genuine strengths. But **adopting Lexical means building without reference implementations**, while TipTap/ProseMirror offer a dozen working Tauri codebases to learn from.

---

## Recurring architectural patterns and pitfalls

**ProseMirror is the de facto standard.** Across 15+ Tauri editor projects surveyed, every one that uses a rich-text framework uses something in the ProseMirror family: TipTap (most common), Remirror, Milkdown, or raw ProseMirror. The ecosystem effect is real — extensions, community knowledge, and debugging resources all favor this stack.

**Rust-side search is a solved problem.** Serious projects avoid JavaScript-based search entirely. The two dominant patterns are **SQLite FTS5** (used by Otterly, Kuku, and others) for simplicity and **Tantivy** (used by HelixNotes) for Lucene-grade performance. Both run entirely in Rust, keeping the JS thread free for editor responsiveness.

**IPC is the bottleneck to design around.** Multiple developers reported that Tauri's JavaScript-to-Rust IPC bridge becomes slow with large data transfers. The consistent advice is to do heavy processing (search indexing, file parsing, AI inference) entirely on the Rust side and send only minimal payloads to the frontend. Moraya's layered architecture — with an explicit service layer mediating between the Svelte store and Tauri IPC — is the cleanest abstraction for this.

**WebView inconsistencies bite.** Tauri uses the system WebView (WebKit on macOS, WebView2 on Windows, WebKitGTK on Linux), and editor behaviors can differ across platforms. This is why several projects (MarkditorApp, WebNotes) maintain abstraction layers around platform-specific APIs. Any IPC or filesystem code should be wrapped behind a clean interface.

**Zustand dominates state management.** MarkFlowy, Typethings, WebNotes, Open Note, and mdSilo all use Zustand. Its functional store pattern is the closest thing to a community standard in Tauri + React apps.

---

## Effect-TS: completely absent from this ecosystem

No Tauri editor project, across all sources checked (GitHub, awesome-tauri, Reddit, Hacker News, Codeberg, dev forums), uses **Effect-TS** or any explicit functional effect system. The closest functional patterns observed are Zustand's store model and immer's immutable updates in mdSilo. Effect-TS's ecosystem remains focused on backend/server applications and has no known integration with Tauri desktop development. Introducing Effect-TS would be genuinely novel — and unsupported by any existing reference implementation.

---

## Recommended combination strategy

No single repository covers the full requirements. The optimal approach is to **take Typethings' monorepo structure as the scaffold, adopt MarkFlowy's ProseMirror/Remirror editor patterns, and integrate Otterly's Rust-side SQLite FTS5 search layer.**

**Typethings** provides the cleanest starting point: its Turborepo monorepo with separated `editor`, `ui`, and `fs` packages is immediately extensible. Fork it and replace the TipTap editor package with either Lexical (if you're committed to that path) or Remirror (if you want working references to study).

**MarkFlowy** demonstrates how to wire ProseMirror/Remirror into a full-featured Tauri React app with dual editing modes, file tree management, and AI integration. Its codebase is the most complete reference for the React + ProseMirror + Tauri v1 pattern, though its AGPL license means you'd study the patterns rather than directly forking code.

**Otterly's Rust backend** solves the search and file-indexing problem elegantly with SQLite FTS5 + BM25 ranking, vault-based storage, and wiki_link tracking with backlinks/outlinks. Port its Rust-side search and file-watching architecture into the Tauri backend of your Typethings-based scaffold.

If you choose to proceed with Lexical despite the absence of Tauri reference implementations, the `svelte-lexical` package (https://github.com/umaranis/svelte-lexical) and the `verbum` component library (https://github.com/ozanyurtsever/verbum) provide the most relevant starting points for understanding how Lexical integrates into component frameworks — though neither targets desktop apps. Expect to build the Tauri integration layer from scratch.
