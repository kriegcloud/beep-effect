# Open-source rich-text note-taking editors with a Tauri + React + TypeScript stack

## Scope and evaluation criteria

This research targets **open-source GitHub repositories** that implement a **desktop note-taking editor** in the “Obsidian/Notion neighborhood” (i.e., practical personal knowledge capture with either Markdown-centric workflows, block-based rich text, or hybrid editing). All candidates are evaluated against your required stack and then ranked by coverage of the remaining preferences.

### Requirements interpreted for ranking

A repository is considered **eligible** only if there is evidence it includes all of:

- **Tauri (v1 or v2) as the desktop shell**
- **React** frontend
- **TypeScript**

Eligible repos are then scored (to rank higher) based on:

- **Strongly preferred**
  - **Lexical** editor engine
  - **Local-first / filesystem-backed storage** (no mandatory cloud sync)
- **Nice to have**
  - **Effect-TS**
  - **Plugin / extension architecture**
  - **Markdown import/export or hybrid WYSIWYG + Markdown**

Where a feature is not explicitly stated, I label it as an inference (and treat it conservatively).

## Research method and source constraints

I started by inspecting the repository you explicitly surfaced via the GitHub connector (**kriegcloud/beep-effect**) and then broadened discovery using public web evidence from GitHub repo landing pages, READMEs, package manifests, tags, release metadata, and commit feeds. citeturn5view0turn7view0turn4view0

A recurring limitation during this run: some GitHub “commits”/“releases” pages intermittently failed to load (so a few “last meaningful commit date” fields could not be verified directly). In those cases, I used the **latest visible release date** and/or **recent tag timestamps** as a maintenance proxy, and I call that out explicitly.

## Ranked repository findings

### entity["organization","moldable-ai","github org"]/moldable — Lexical + local-first primitives in a Tauri v2 desktop monorepo

**Repo + stars:** https://github.com/moldable-ai/moldable — 9 stars. citeturn59view0  
**Last meaningful commit date:** Not retrievable via GitHub commit listing during this run (page fetch failed). The repo shows **114 commits** total, which at least indicates non-trivial ongoing work. citeturn59view0

**Requirements coverage**
- Tauri desktop shell: **Yes (Tauri v2)** — repo explicitly describes the desktop app as “Tauri desktop app (Rust + React)” and lists “Desktop: Tauri v2 (Rust backend + React frontend).” citeturn59view0  
- React: **Yes** — explicitly stated. citeturn59view0  
- TypeScript: **Yes** — explicitly stated; also “Vite + React 19 + TypeScript.” citeturn59view0  
- Lexical: **Yes** — the repo structure calls out `packages/editor` as a “Lexical markdown editor.” citeturn59view0  
- Local-first / filesystem-backed: **Yes** — README states “Everything runs locally on your machine… the code and data live on your computer,” and `packages/storage` is described as “File storage utilities / Filesystem storage utilities.” citeturn59view0  
- Effect-TS: **No evidence** in surfaced metadata. citeturn59view0  
- Plugin/extension architecture: **Partial** — “personal OS” concept + “generated apps” framework implies extensibility, but there is no explicit plugin API described in the excerpted README/structure. citeturn59view0  
- Markdown import/export or hybrid: **Yes (hybrid-leaning)** — positioned as a “Rich text markdown editor (Lexical).” citeturn59view0

**Architecture summary & notable design decisions**
This is a **monorepo** split into:
- `desktop/`: Tauri desktop container (Rust backend + React UI)  
- `packages/editor/`: a reusable **Lexical-based Markdown editor**  
- `packages/storage/`: filesystem storage utilities  
- `prds/`: product specification documents  
The system is explicitly designed so that **apps and data run locally**, with optional API integrations for cloud/AI when desired. It also distinguishes “generated apps” (Next.js + React + TypeScript) from the desktop runtime. citeturn59view0  
The separation of editor/storage into packages suggests an intentional “reuse the core editor/storage across multiple apps” strategy—useful if you want to extract just the editor and plug it into your own note model. citeturn59view0

**Known limitations vs your target**
- Stars are low (early stage) and commit recency could not be confirmed from GitHub’s commit listing in this run. citeturn59view0  
- It is not marketed as a traditional note-taking app; it’s a “personal OS” that generates apps. If you want an “Obsidian vault” experience, you’d likely build that on top of their storage + editor packages rather than adopting the whole product direction. citeturn59view0

---

### entity["people","kriegcloud","github user"]/beep-effect — Tauri v2 + React + TypeScript + Lexical + Effect-TS in a large monorepo

**Repo + stars:** https://github.com/kriegcloud/beep-effect — 46 stars. citeturn5view0  
**Last meaningful commit date:** GitHub commit list shows commits on **March 9, 2026**. citeturn4view0

**Requirements coverage**
- Tauri desktop shell: **Yes (Tauri v2 implied)** — root `package.json` includes `@tauri-apps/api` and `@tauri-apps/cli` at `^2.10.1`, and repo language breakdown includes Rust (typical for a Tauri backend). citeturn8view0turn6view2  
- React: **Yes** — `react` and `react-dom` appear in dependencies. citeturn8view2  
- TypeScript: **Yes** — repo language breakdown is majority TypeScript; TypeScript configs exist at root. citeturn6view2  
- Lexical: **Yes** — dependencies include `lexical`, `@lexical/react`, and multiple Lexical packages, including `@lexical/markdown`. citeturn8view2turn8view3  
- Local-first / filesystem-backed: **Unclear from surfaced metadata** — no README/“About” description is provided on the repo landing page, and I did not find explicit storage claims in the captured excerpts. citeturn6view2turn5view0  
- Effect-TS: **Yes** — the root dependencies list many `@effect/*` packages and the repo topics include `effect-ts`. citeturn8view4turn6view2  
- Plugin/extension architecture: **Unclear** — not described in the captured metadata. citeturn5view0  
- Markdown import/export or hybrid: **Likely partial** — presence of `@lexical/markdown` suggests Markdown conversion/interop is in scope, but actual import/export UX is not confirmed. citeturn8view3

**Architecture summary & notable design decisions**
From the public surface, this appears to be a **large, multi-area monorepo** (thousands of commits) with `apps/` and `packages/` directories and a heavy emphasis on tooling/quality/configuration. citeturn5view0turn4view0  
The dependency set indicates an intentional combination of:
- **Tauri v2** for desktop packaging,  
- **React + TypeScript** for UI,  
- **Lexical** for rich text editing,  
- **Effect-TS** as a foundational application architecture choice. citeturn8view0turn8view2turn8view3turn8view4

**Known limitations vs your target**
- The repo landing page provides **no product-level description**, so it’s not possible (from the captured evidence alone) to confirm it is specifically a “note-taking app” rather than a broader application framework with an editor component. citeturn6view2turn5view0  
- Local-first/filesystem-backed storage and plugin architecture are not confirmed in the surfaced material. citeturn5view0

---

### entity["organization","fastrepl","github org"]/char — local-first meeting notepad in Tauri with a plugin-heavy architecture and Effect-TS

**Repo + stars:** https://github.com/fastrepl/char — ~8.1k stars. citeturn30view0  
**Last meaningful commit date:** GitHub commit history shows commits on **March 17, 2026**. citeturn29view0

**Requirements coverage**
- Tauri desktop shell: **Yes (Tauri v2)** — the desktop app includes `src-tauri/`, and dependencies include `@tauri-apps/api` `^2.10.1` plus multiple `@tauri-apps/plugin-*` packages. citeturn25view0turn28view0  
- React: **Yes** — desktop package uses `react` and `react-dom`. citeturn28view0  
- TypeScript: **Yes** — desktop has TypeScript tooling and `typescript` is present. citeturn28view0  
- Lexical: **No** — the desktop package depends on a TipTap workspace package (`@hypr/tiptap`) rather than Lexical. citeturn28view0  
- Local-first / filesystem-backed: **Yes (local-first, SQLite)** — README explicitly says “All your notes, transcripts, and data are stored locally… in a local SQLite database,” while cloud features are optional. citeturn30view0  
- Effect-TS: **Yes** — desktop dependencies include `effect` and `@effect/schema`. citeturn28view0  
- Plugin/extension architecture: **Yes** — the desktop package depends on many internal `@hypr/plugin-*` modules, and the repo contains a `plugins/` area and plugin examples. citeturn28view0turn30view0  
- Markdown import/export or hybrid: **Partial** — evidence suggests a hybrid approach (rich editor + Markdown tooling). The desktop depends on `streamdown` and Unified/ReText/remark-style tooling, which typically supports Markdown pipelines, but specific Markdown import/export UX is not confirmed in the captured excerpt. citeturn28view0turn30view0

**Architecture summary & notable design decisions**
Char is a **meeting note capture system**: it records audio locally, transcribes, and enriches notes with summaries (optionally), while still allowing “memos” inputs. citeturn30view0  
Key design decisions visible in the repo surface:
- It is explicitly designed to operate **offline** via entity["company","LM Studio","local llm tool"] or entity["company","Ollama","local llm runtime"]. citeturn30view0  
- Core user data is kept local in SQLite even if the user opts into cloud-quality transcription/summarization during onboarding. citeturn30view0  
- The codebase is organized around **many “plugins”** (auth, filesystem DB, import/export, etc.), suggesting a modular internal extension system rather than a monolithic app. citeturn28view0turn30view0  
This combination (local DB + modular plugin wall + Tauri v2) is unusually aligned with “local-first” desktop app architecture patterns. citeturn30view0turn28view0

**Known limitations vs your target**
- Editor engine is not Lexical (it appears TipTap-based). citeturn28view0  
- While local-first is strong, the product does support cloud-powered features and account onboarding (even if data stays local and offline mode is supported). If your “no mandatory cloud ever” requirement is strict, you’d need to validate whether the onboarding/account requirement can be fully bypassed. citeturn30view0

---

### entity["people","iBManu","github user"]/Noetiq — encrypted vault-based note-taking with a Notion-like block editor on Tauri

**Repo + stars:** https://github.com/iBManu/Noetiq — 16 stars. citeturn31view0  
**Last meaningful commit date:** Not retrievable from commit listing during this run (page fetch failed). Latest release shown is **Noetiq v0.2.0** dated **September 3, 2025**, which is the most recent verifiable maintenance signal captured here. citeturn43view0

**Requirements coverage**
- Tauri desktop shell: **Yes** — repo contains `src-tauri/`, and README explicitly says it is built with Tauri for “minimal resource usage and high performance.” citeturn31view0turn43view0  
- React: **Yes** — topics list includes `react`. citeturn31view0  
- TypeScript: **Yes** — topics list includes `typescript`; language breakdown includes TypeScript as the largest share. citeturn43view0  
- Lexical: **No** — topics show `editorjs` (Editor.js) rather than Lexical. citeturn43view0  
- Local-first / filesystem-backed: **Yes (local-first + encrypted)** — README explicitly states “All data is stored locally and encrypted using AES-256-GCM,” with notes only decrypted during editing. citeturn43view0  
- Effect-TS: **No evidence**. citeturn43view0  
- Plugin/extension architecture: **No evidence** (likely absent or not yet documented). citeturn43view0  
- Markdown import/export or hybrid: **Not currently** — roadmap lists export (HTML/PDF) as a future goal, but Markdown import/export is not mentioned in the captured README. citeturn43view0

**Architecture summary & notable design decisions**
Noetiq is explicitly structured around:
- **Vault management** as the primary container concept. citeturn43view0  
- A **block-based “Notion-like editor”** for rich content. citeturn43view0  
- A strong confidentiality model (AES-256-GCM encryption, password-derived key, decrypt-on-edit then re-encrypt). citeturn43view0  
This is (among the repos reviewed) the clearest example of an open-source Tauri note app with a “secure vault + block editor” posture. citeturn43view0

**Known limitations vs your target**
- Editor engine is not Lexical. citeturn43view0  
- Maintenance/recency is uncertain: the latest verifiable release date captured is September 3, 2025, and commit history could not be retrieved during this run. citeturn43view0  
- Export/import features (HTML/PDF export) are listed on the roadmap, suggesting they may not be present yet. citeturn43view0

---

### entity["organization","codexu","github org"]/note-gen — Markdown-first note-taking with native Markdown storage on Tauri

**Repo + stars:** https://github.com/codexu/note-gen — ~11.2k stars. citeturn46view0  
**Last meaningful commit date:** Direct “commits” page evidence was inconsistent during this run. However, the repo’s tags show active releases in early March 2026 (e.g., tag `note-gen-v0.26.4` dated **March 8, 2026**), and the repo landing page shows a “Latest” release dated **March 29, 2026**. citeturn50view0turn46view0

**Requirements coverage**
- Tauri desktop shell: **Yes** — repo includes `src-tauri/` and topics include `tauri`. citeturn46view0  
- React: **Yes (via Next.js)** — topics include `nextjs`, which is React-based; the app is described as a cross-platform Markdown note-taking app. citeturn46view0  
- TypeScript: **Yes** — language and `next.config.ts`/`tsconfig.json` indicate TypeScript. citeturn46view0  
- Lexical: **No evidence** — no Lexical mention in the captured repo surface. citeturn46view0  
- Local-first / filesystem-backed: **Yes (Markdown-native)** — README lists “Native Markdown storage format.” citeturn46view0  
- Effect-TS: **No evidence**. citeturn46view0  
- Plugin/extension architecture: **Partial** — the project emphasizes MCP support for tool integration, but that is not the same as a general editor plugin API. citeturn46view0  
- Markdown import/export or hybrid: **Yes (Markdown-first)** — the whole product is centered around Markdown notes with native Markdown storage. citeturn46view0

**Architecture summary & notable design decisions**
NoteGen positions itself as a three-part app: recording, notes, and AI dialogue, with AI helping reorganize/expand “recordings” into coherent notes. citeturn46view0  
For your purposes, the most relevant design decision is the choice of **native Markdown storage**, which makes it naturally closer to an “Obsidian vault” model than a block-JSON model. citeturn46view0  
It also explicitly promotes sync solutions (and WebDAV appears as a topic), suggesting optional remote syncing rather than mandatory cloud storage. citeturn46view0

**Known limitations vs your target**
- No sign of Lexical; likely not a “Notion-like” rich editor (more of a Markdown workflow). citeturn46view0  
- The “commits” view was inconsistent during this run; recency is supported more strongly by tags/releases than by a successfully loaded commit feed. citeturn50view0turn46view0

## Comparative gap analysis against your ideal target

Your “full match” ideal is: **Tauri + React + TypeScript + Lexical + local-first filesystem-backed storage**, with bonus for **Effect-TS + plugin architecture + Markdown interop**.

No single repo above is a perfect “all boxes checked, clearly a note app, clearly maintained, clearly extensible” match based on verifiable evidence captured in this run:

- **Best verified “Lexical + local-first filesystem” foundation:** moldable-ai/moldable, because it explicitly packages a Lexical Markdown editor and filesystem storage utilities in a Tauri v2 + React + TypeScript desktop monorepo. citeturn59view0  
- **Best verified “note app with strong local-first posture + extensibility” implementation:** fastrepl/char, because it explicitly stores notes locally in SQLite, has a plugin-heavy internal architecture, and uses Effect-TS—while missing Lexical specifically. citeturn30view0turn28view0  
- **Best verified “security-first vault + block editor note app”:** iBManu/Noetiq, because of explicit AES-256-GCM local encryption + vault model—while missing Lexical and with uncertain maintenance recency. citeturn43view0  
- **Best verified “Obsidian-like Markdown vault orientation”:** codexu/note-gen, via native Markdown storage and cross-platform Tauri packaging—while missing Lexical and leaning away from a rich-block editor model. citeturn46view0  
- **Most “your stack exactly (Lexical + Effect-TS + Tauri v2 + React + TS)” but unclear product:** kriegcloud/beep-effect is the closest to your *technology* wish list (Lexical + Effect-TS + Tauri v2), but the repo surface does not clearly establish “note-taking app” semantics or local-first storage. citeturn8view3turn8view4turn4view0

## Closest repo combinations and how to combine approaches

### Combine Moldable’s Lexical editor + storage, Noetiq’s encryption model, and Char’s extensibility pattern

This is the most direct path to your “ideal” design, because each repo contributes a distinct, high-signal part:

- Use **moldable-ai/moldable** as the **editor + storage substrate**:
  - Extract or emulate `packages/editor` (Lexical Markdown editor) and `packages/storage` (filesystem utilities) inside your own app monorepo. citeturn59view0  
  - Keep the desktop container architecture (Tauri v2 + React + TS) as a proven baseline. citeturn59view0

- Borrow **iBManu/Noetiq**’s **vault + encryption posture**:
  - The “decrypt only while editing, re-encrypt at rest” model is well aligned with local-first + privacy requirements, and it maps cleanly onto a filesystem-backed design (encrypted note blobs in a vault directory). citeturn43view0  
  - If you keep Lexical as the editor, the main integration decision becomes: “is encrypted-at-rest storage a file-per-note model, or an encrypted SQLite DB?” Noetiq demonstrates the security story either way (the README is storage-format-agnostic, but encryption semantics are clear). citeturn43view0

- Emulate **fastrepl/char**’s **plugin-oriented internal modularity + Effect-TS usage**:
  - Char’s dependency graph shows a design where major capabilities (filesystem DB, import/export, hooks, UI subsystems) are modularized as many packages/plugins. citeturn28view0  
  - If you want Effect-TS, Char is the clearest example in this set where `effect` is already in the desktop app dependency set. citeturn28view0  
  - Even if you don’t copy code, copying the organizational pattern (package-per-capability, consistent plugin interface, dependency injection boundaries) is likely to save you architecture churn later. citeturn28view0turn30view0

### Alternate “Obsidian-like” combination: NoteGen-style Markdown vault + Lexical for WYSIWYG

If your goal is “Obsidian-like files on disk” with a richer editor:

- Use **codexu/note-gen**’s “native Markdown storage format” concept as the primary storage contract. citeturn46view0  
- Use **moldable-ai/moldable**’s Lexical Markdown editor approach to render/edit Markdown with a rich-text experience, preserving on-disk Markdown as the single source of truth. citeturn59view0turn46view0  

This approach tends to be easier for interoperability (git, external editors, search tools), at the cost of dealing with “lossy” conversions if you introduce non-Markdown-native blocks.

### Where beep-effect could fit

If you decide you want **Lexical + Effect-TS + Tauri v2** baked into the foundation from day one, **kriegcloud/beep-effect** is the most technology-aligned repo in this set based on its dependency choices (Lexical + Effect-TS + Tauri v2 + React). citeturn8view0turn8view3turn8view4  
But because its repo surface does not clearly describe the product as a note-taking editor, the safest way to use it is as:
- an “architecture reference” for integrating Effect-TS with a Tauri + React + Lexical stack, rather than as a “drop-in note app.” citeturn5view0turn4view0