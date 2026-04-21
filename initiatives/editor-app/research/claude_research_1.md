# Tauri + React rich text editor repos worth studying

**No repository combines Tauri + React + Lexical today — and Effect-TS + rich text editing is entirely uncharted territory.** But a vibrant ecosystem of Tauri-based note-taking apps exists, overwhelmingly using ProseMirror or TipTap as their editor framework. The best options range from full Obsidian alternatives with 7,000+ stars to architecturally ambitious smaller projects. Lexical adoption remains concentrated in the web-only world, making any Tauri + Lexical project a genuine greenfield opportunity.

Below is every meaningful repository found, organized by relevance to your stack.

---

## Tauri + React + rich text editors: the core matches

These repos hit the required stack (Tauri + React + TypeScript) and use a rich text editor for note-taking or knowledge management. They are your closest starting points.

### Hyprnote / Char — **~7,900 ★**
**URL:** https://github.com/fastrepl/char (originally fastrepl/hyprnote, ~5,200 ★ on old repo)
**Stack:** Tauri 2.x, React, TypeScript, **TipTap** (custom extensions), TinyBase, Zustand, TanStack Query, Rust, pnpm monorepo
**What it does:** Privacy-first AI notepad for meetings. Captures audio, transcribes locally via llama.cpp, and generates personalized summaries. Not a general PKM tool, but its editor and architecture are extremely well-engineered.
**Local filesystem:** Yes — local-first, SQLite database, file-based notes. All data on-device.
**Maintenance:** Very active. YC S25 company. Issues filed daily as of March 2026. macOS public beta; Windows/Linux planned Q2 2026.
**Architecture highlights:**
- **tauri-specta** for fully type-safe Rust↔TypeScript IPC with autocomplete and compile-time checking
- Actor-based concurrency using `ractor` — root supervisor spawned before Tauri builder, child actors for STT and network
- Custom TipTap package (`packages/tiptap`) with extensions for AI highlighting, streaming animation, attachment images, link boundary guards
- Sentry integration with minidump crash recovery
- Markdown serialization (json2md/md2json) for session content
- Multi-window React architecture with pathname-based routing

### Lokus — **~666 ★**
**URL:** https://github.com/lokus-ai/lokus
**Stack:** React 19, **TipTap 3**, Tailwind CSS, Vite 7, Rust, Tauri 2.0, SQLite, Three.js/D3-force (graphs), TLDraw (canvas)
**What it does:** The most ambitious open-source Obsidian alternative built with Tauri + React. Full Obsidian vault compatibility — point it at your existing vault and it works. Combines Obsidian's local-first markdown with Notion-like database views ("Bases"), 2D/3D knowledge graphs, JSON Canvas support, and a built-in MCP server with 68+ AI tools.
**Local filesystem:** Yes — standard markdown files, no proprietary format. ~50MB RAM vs 300MB+ for Electron apps.
**Maintenance:** Active development, Open Collective funding, v1.1.0 released March 2026. Community reports it's still rough around the edges (UI polish, occasional lag).
**Architecture highlights:**
- **177 registered Tauri commands** bridging React frontend and Rust backend
- React Context for state management (no Redux or Zustand)
- "Quantum" search architecture leveraging Rust's memory safety for millisecond queries across thousands of notes
- Separate Tauri configs per platform
- ⚠️ Uses JSX, not TSX — could be migrated to TypeScript but isn't currently typed

### MarkFlowy — **~2,200 ★**
**URL:** https://github.com/drl990114/MarkFlowy
**Stack:** TypeScript, Rust, Tauri, **ProseMirror/Remirror** (React wrapper for ProseMirror)
**What it does:** AI-powered markdown editor with WYSIWYG and source code modes. Integrates DeepSeek and ChatGPT for translation, summarization, and conversation export. Custom shareable themes, keyboard shortcuts. Supports MD, JSON, TXT editing.
**Local filesystem:** Yes — reads/writes local files with file tree navigation. Under 10MB bundle.
**Maintenance:** Actively maintained, 1,574+ commits, AGPL-3.0 license.
**Architecture highlights:**
- Remirror (React-native ProseMirror wrapper) provides the extensible WYSIWYG layer
- AI features integrated via external API calls through Tauri backend
- Multiple editing modes (WYSIWYG, source) with seamless switching
- Custom theme system with sharing capability

### mdSilo — **~76 ★**
**URL:** https://github.com/mdSilo/mdSilo-app
**Stack:** React, TypeScript, **ProseMirror**, Tauri, Rust
**What it does:** All-in-one local-first knowledge base AND feed reader. Editor supports Markdown, WYSIWYG, and MindMap views. Features wiki_links (`[[link]]`), hashtags, graph view, Kanban board, chronicle/timeline view, task management, full-text search, mermaid diagrams, KaTeX/LaTeX, code highlighting, PDF/epub annotation, slash commands, and hovering toolbar.
**Local filesystem:** Yes — plain-text markdown files, no registration required.
**Maintenance:** Active, AGPL-3.0 license. Lower star count but feature-rich.
**Architecture highlights:**
- ProseMirror editor with extensive custom extensions
- Doubles as RSS/Atom/podcast reader — unusual breadth for a PKM tool
- Export to PDF/PNG built in
- **Closest to Obsidian feature parity** among React+TS+Tauri projects

### Kompad — **~561 ★**
**URL:** https://github.com/hudy9x/kompad
**Stack:** Tauri, React, TypeScript, **TipTap**, Zustand, Firebase (Auth + Firestore + Storage), Algolia (search)
**What it does:** Full-featured note app for developers. Folder/tag organization, favorites, word count, dark/light mode + custom themes, cross-device sync, image drag-and-drop, auto-updates.
**Local filesystem:** ❌ No — cloud-based via Firebase Firestore. Not local-first.
**Maintenance:** Functional but developer has noted it's not receiving frequent updates.
**Architecture highlights:**
- Zustand for React state management
- TipTap as WYSIWYG editor with StarterKit
- Firebase handles auth, persistence, and file storage; Algolia for full-text search
- Also available as Vercel-hosted web version

### Typethings — **~61 ★**
**URL:** https://github.com/pheralb/typethings
**Stack:** Tauri, React, Next.js, TypeScript, **TipTap** (custom unstyled primitives), Zustand, shadcn/ui, Tailwind CSS
**What it does:** Open-source markdown editor. Create/read/delete markdown files, workspace management, file browser, CMD+K search, syntax highlighting, light/dark mode, fully offline.
**Local filesystem:** Yes — reads/writes markdown files from local workspaces via custom `@typethings/fs` package wrapping Tauri's filesystem API.
**Maintenance:** Active, 309 commits.
**Architecture highlights:**
- **Excellent monorepo pattern** — `@typethings/editor` (unstyled TipTap primitives), `@typethings/fs` (Tauri filesystem wrapper), `@typethings/ui` (React UI components with shadcn/ui + Tailwind)
- Clean separation of concerns across workspace packages
- Good reference for how to abstract Tauri filesystem APIs into a reusable package

### Typability — **~128 ★**
**URL:** https://github.com/SimonShiki/Typability
**Stack:** Tauri, React, TypeScript, **Milkdown** (ProseMirror-based), FluentUI, Vite
**What it does:** Typora-like WYSIWYG markdown editor with Fluent Design (Microsoft aesthetic). Mica/Acrylic background effects, lightweight bundle, multi-language support.
**Local filesystem:** Yes — reads/writes local markdown files.
**Maintenance:** Active, 422 commits, BSD-3-Clause.
**Architecture highlights:**
- Milkdown's plugin-driven ProseMirror wrapper for WYSIWYG
- FluentUI React components for Windows-native appearance
- Tauri native window features (Mica/Acrylic transparency effects)

### Open Note — small/growing
**URL:** https://github.com/JeremiasVillane/open-note
**Stack:** Tauri, React, Vite, **TipTap**, Mantine, Zustand, Tailwind, react-i18next, react-pdf, TypeScript
**What it does:** Desktop note-taking with rich text editing, note encryption, internationalization, and PDF export.
**Local filesystem:** Yes — local note storage via Tauri/Rust backend.
**Maintenance:** Alpha stage, actively developed.
**Architecture highlights:**
- Clean separation: Mantine for layout, TipTap for editing, Zustand for state, react-pdf for export
- Rust backend handles encryption and filesystem operations
- i18n built in from the start

### CogniWeave — **~0 ★** (brand new)
**URL:** https://github.com/CaptnRumpy/CogniWeave
**Stack:** Tauri v2, React 19, TypeScript, **TipTap Block Editor**, React Flow (2D graph), Force-Graph (3D), Zustand, SQLite, KùzuDB (graph DB), Yjs (CRDT), Ollama (local AI), iroh (QUIC peer sync)
**What it does:** Ambitious knowledge management combining block editing, 2D/3D knowledge graphs, AI copilot, collaborative editing, and P2P sync.
**Local filesystem:** Yes — SQLite for local storage, TipTap AST as JSON, CRDT updates as binary blobs.
**Maintenance:** Very early (4 commits), but **exceptionally detailed architecture documentation**.
**Architecture highlights:**
- Strict rule: "If it touches disk, a database, or an AI model → it belongs in Rust"
- SQLite with 9 tables + FTS5 for full-text search
- KùzuDB graph database as managed sidecar via Tauri shell plugin
- Yjs CRDTs with Y.Doc ↔ yrs::Doc sync for collaboration
- Lamport clock ordering for operation logs
- `.cursorrules` file enforces architectural integrity — worth reading even if the app is nascent

---

## Lexical-based apps worth adapting to Tauri

No significant Lexical + Tauri project exists. These web-based Lexical implementations represent the best candidates for wrapping in a Tauri shell or extracting editor patterns from.

### Payload CMS — **~30,000 ★**
**URL:** https://github.com/payloadcms/payload
**Stack:** TypeScript, Node.js, React, Next.js, MongoDB/Postgres
**Lexical depth:** Very deep — **Lexical is the default rich text editor** since Payload 2.0. The `@payloadcms/richtext-lexical` package implements a full "features" system on top of Lexical with modular capabilities (tables, collapsibles, mentions, slash commands, embeds, AI). Supports nested editors via LexicalNestedComposer. Import/export to HTML, Markdown, and JSON.
**Why it matters:** The most mature, battle-tested Lexical integration in open source. Its feature-based plugin architecture is the gold standard for building on Lexical.

### shadcn/editor — **~1,318 ★**
**URL:** https://github.com/htmujahid/shadcn-editor
**Stack:** Next.js, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Lexical
**Lexical depth:** High. Installable via `npx shadcn@latest add`. Wraps LexicalComposer with SerializedEditorState for controlled state. Plugin system with `nodes.tsx` and `plugins.tsx` for extending. Floating toolbars, content metrics, theme toggling, font customization.
**Why it matters:** Fast-growing, well-documented, and designed for composability. The registry-based distribution model and shadcn/ui styling would integrate cleanly into a Tauri + React app.

### Lobe Editor — **~112 ★**
**URL:** https://github.com/lobehub/lobe-editor
**Stack:** TypeScript, React, Lexical
**Lexical depth:** Very high. Features a unique **dual-architecture design** — a framework-agnostic `IEditorKernel` interface and a React integration layer. Plugin system with file upload, mentions, tables. Pre-built `ChatInput` component for AI chat interfaces. Part of the LobeHub ecosystem (Lobe Chat has 100k+ stars).
**Why it matters:** The kernel/React separation is architecturally the most sophisticated Lexical wrapper found. The `IEditorKernel` could theoretically be adapted for other frontends or integrated with Effect-TS patterns.

### Verbum — **729 ★**
**URL:** https://github.com/ozanyurtsever/verbum
**Stack:** React, TypeScript, Lexical, Storybook
**Lexical depth:** Moderate-high. Composable toolbar API — each formatting option is a separate React component (`BoldButton`, `FontFamilyDropdown`, etc.). Supports hashtags, mentions, emojis, tables.
**Why it matters:** One of the earliest substantial Lexical wrappers. Good reference for component-based toolbar composition patterns.

### Notiq — small but published on npm
**URL:** https://github.com/chinonsochikelue/notiq
**Stack:** Next.js, TypeScript, Tailwind, Lexical, OpenAI GPT-4, Pinecone, Redis
**Lexical depth:** Very high. 40+ content blocks, Excalidraw integration, equations, polls, drag-and-drop, AI content generation, markdown import/export. One of the most feature-rich Lexical-based editors found.
**Why it matters:** Closest to an actual Notion-like note-taking application built on Lexical.

### LexKit — new (launched Sept 2025)
**URL:** https://github.com/novincode/lexkit
**Stack:** TypeScript, React, Lexical
**What it does:** Headless, type-safe editor framework. `createEditorSystem()` returns typed Provider, hooks, and extension-inferred commands. 25+ built-in extensions. HTML/Markdown export.
**Why it matters:** The extension-based composition pattern and type-safe command inference are particularly interesting for a TypeScript-heavy project.

---

## Tauri-based Obsidian alternatives using other frontend frameworks

These don't use React but have valuable architectural patterns or could inspire your project.

| Repo | Stars | Frontend | Editor | Local FS | Key differentiator |
|------|-------|----------|--------|----------|--------------------|
| [Otterly](https://github.com/ajkdrag/otterly) | Small | Svelte 5 | Milkdown/ProseMirror | ✅ | Obsidian vault compatible, SQLite FTS5 search, wiki_links with auto backlinks |
| [Moraya](https://github.com/zouwei/moraya) | Small | Svelte 5 | Milkdown/ProseMirror | ✅ | AI agent capabilities via MCP, ~10MB, detailed layered architecture |
| [Fluster](https://github.com/flusterIO) | Small | React + TS | MDX-based | ✅ | Academic/STEM focus: LaTeX, .bib citations, Jupyter integration planned |
| [Gramax](https://github.com/Gram-ax/gramax) | ~511 | TBD | TipTap/ProseMirror | ✅ | Docs-as-code with built-in Git integration, dual desktop+browser deployment |
| [Marko](https://github.com/SeanPedersen/Marko) | Small | Lightweight | Custom | ✅ | Basic git integration (commit/revert/push), wiki_links, tabbed interface |

---

## The gaps: Effect-TS and Lexical + Tauri are uncharted

**Effect-TS + any rich text editor:** After exhaustive searching, **zero public repositories** combine Effect-TS with Lexical, TipTap, ProseMirror, Slate, or any other editor framework. The Effect ecosystem covers SQL, HTTP, CLI, and platform abstractions, but rich text editing is a complete blind spot. This is a genuine greenfield opportunity — Effect's typed error handling and service-oriented architecture could map naturally onto editor state management, plugin lifecycles, and filesystem I/O.

**Lexical + Tauri:** No meaningful project exists. The Tauri desktop ecosystem has converged on **TipTap and ProseMirror** (with Milkdown as a third option). Lexical adoption is concentrated in web-only apps, predominantly within the Next.js/Payload CMS ecosystem. Building a Tauri + React + Lexical app would be genuinely novel.

---

## Architectural patterns worth stealing

Across all repositories studied, several patterns emerge as best practices for Tauri + React rich text editor applications.

**State management follows a three-layer pattern** in the best projects: `useState` for component-local state, **Zustand** for global UI state (dominant over Redux across every repo), and either TanStack Query or Tauri's plugin-store for persistent data bridging to Rust. Hyprnote is the exception, using TinyBase as its primary data store.

**Type-safe IPC via tauri-specta** is the gold standard. Both Hyprnote and the dannysmith/tauri-template (~200 ★, https://github.com/dannysmith/tauri-template) use it to generate fully typed Rust↔TypeScript bindings with autocomplete and compile-time checking. This eliminates the fragile string-based `invoke()` calls that plague simpler Tauri apps.

**The "Rust owns all I/O" principle** appears repeatedly — CogniWeave's documentation states it most explicitly ("If it touches disk, a database, or an AI model → it belongs in Rust"), but MarkFlowy, Hyprnote, and Lokus all follow this pattern. The React frontend remains a pure presentation layer; all filesystem operations, database queries, and AI model interactions route through Tauri commands to the Rust backend.

**For search,** SQLite FTS5 is the dominant approach for full-text search across local notes (used by Otterly, CogniWeave, and likely others). Lokus claims a proprietary "Quantum" search architecture. Algolia appears only in Kompad's cloud-based model.

**Monorepo structure** is common in larger projects: Hyprnote uses pnpm workspaces with separate packages for TipTap, and Typethings splits into `@typethings/editor`, `@typethings/fs`, and `@typethings/ui`. This clean separation makes editor logic reusable and testable independent of the Tauri shell.

---

## Conclusion

Your ideal stack (Tauri + React + Lexical + Effect-TS + local filesystem) has no direct precedent — which is both a challenge and an opportunity. The practical path forward: **study Hyprnote and Lokus for Tauri + React architecture patterns** (especially tauri-specta for type-safe IPC, the Rust-owns-I/O principle, and monorepo organization), **study Payload CMS and Lobe Editor for deep Lexical integration patterns** (especially Payload's feature-based plugin system and Lobe's kernel/React separation), and build the bridge yourself. The Typethings monorepo pattern — with a dedicated `@typethings/fs` package wrapping Tauri filesystem APIs — is particularly worth emulating as the glue layer between Lexical's editor state and local markdown files. Given that no one has combined Effect-TS with editor frameworks, you'd be pioneering that integration from scratch, potentially using Effect's service pattern to model editor plugins, file I/O, and error boundaries.
