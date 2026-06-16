# User Story — "The Office Action"

> A day in the practice, told from Tom's chair. Every scene is annotated with the
> capability behind the glass, so product and engineering read the same story.
> Part of the **Prose-to-Proof** doc set — companion to the [Vision](./PROSE_TO_PROOF_VISION.md),
> the [PRD](./product/prose-to-proof.md), and the [Architecture Map](./PROSE_TO_PROOF_ARCHITECTURE_MAP.md).
>
> *All names, matters, and documents below are illustrative. Real client material
> never lives in the repository — only synthetic fixtures do.*

---

## The cast

- **Tom** — solo IP attorney, 25 years in, the user.
- **The matter** — *Aanstoot v. examiner* (illustrative): a utility patent application for a coffee grinder with a "burr alignment sensor," filed eight months ago for a long-time client.
- **The trigger** — a **non-final Office Action** arrives from the USPTO. The examiner has rejected claims 1–8 as obvious (§103) over two prior-art references and wants the application narrowed or argued. Tom has three months to respond.

> *What an Office Action is, in one breath: the patent examiner's written ruling
> rejecting some or all of your claims and citing earlier patents ("prior art")
> as the reason. To respond you must answer every rejection — usually by amending
> claims to be narrower, and/or arguing that the cited art doesn't actually
> disclose your invention. Miss the deadline and the application can go abandoned.*

---

## Scene 1 — It lands, and it's already understood

Tom drops the Office Action PDF into the workbench. By the time he's poured his coffee, it's not just *stored* — it's *read*.

The system has pulled out the moving parts: the two cited references, the specific claims rejected, the examiner's reasoning, and the response deadline. Each one is a tidy card. Tom clicks the deadline; it lands him on the exact line of the PDF that states it, highlighted.

> **Behind the glass.** The document is parsed into the canonical document model
> (`@beep/md`, with DOCX/PDF-origin structure bridged via `@beep/pandoc-ast`). The
> NLP driver (`packages/drivers/nlp-mcp`, 42 tools) tokenizes and finds entities and
> dates *with character offsets*. Span-grounded extraction (`@beep/langextract`,
> `GroundedExtraction.span`) turns "respond by April 12" into a typed **candidate
> claim** whose evidence is the exact character range in the source — the "jump to
> the highlighted line" behavior, the same UX pattern the best document-AI tools use.

## Scene 2 — The prior art, side by side with his own words

The examiner cited two references. Tom opens the first. The system has already lined up the examiner's argument against Tom's own claim language — and, crucially, against the **original application**, surfacing the paragraphs of the specification that support the very limitation the examiner says is missing.

Hovering over "the burr alignment sensor of claim 1," a card appears: the claim text, the spec paragraphs that describe it, **and a link to the CAD file for Figure 3** where the sensor is drawn. Tom hasn't gone looking for any of it. It came to him.

> **Behind the glass.** This is the **editor-as-portal**. The hover card is an
> `ArtifactRefNode` (`packages/foundation/modeling/lexical/src/Lexical.model.ts`) —
> a block that links a spot in the document to a runtime artifact (here, the CAD
> file) by a stable id, surfaced as `artifact://…`. The "claim ↔ spec ↔ figure"
> links are edges in the matter's subgraph; the editor is a window onto it.

## Scene 3 — A distinction worth making

The system flags something Tom would have caught eventually: reference 1 describes a sensor that measures *grind size after the fact*, while Tom's claim is a sensor that aligns the burrs *before* grinding. That's a real, arguable distinction. It proposes a draft argument making exactly that point — and pulls the supporting sentence from reference 1's own text to use against it.

But it does **not** assert "the references are distinguishable" as a fact. It marks it as a **suggestion awaiting Tom's judgment**, because that's a legal conclusion, and legal conclusions are his to make.

> **Behind the glass.** The proposed distinction is a **candidate claim** with
> attached **evidence** and **provenance** (`packages/epistemic/domain/src/entities/`
> — `CandidateClaim`, `Evidence`, `Activity`). It is *candidate*, not accepted: the
> agent may read context and propose writes, but only human approval promotes a
> candidate into authoritative state (`goals/agentic-professional-runtime/SPEC.md`).
> Before any proposal is even allowed to *become* a fact later, it must pass the
> boundary — shape-checked by SHACL and proven consistent
> (`packages/foundation/capability/semantic-web`). Confidence proposes; proof admits.

## Scene 4 — The draft, in his voice

Tom asks for a full response draft. What comes back already reads like *him* — the way he opens with the strongest distinction, his measured tone, his habit of quoting the reference's own language back at it. It's a first draft, not a final one, but it's a first draft he'd actually have written.

Every factual sentence in the draft has a little anchor. Tom clicks one mid-paragraph — "Reference 1 teaches measurement *downstream* of grinding" — and lands on the exact line in reference 1 that says so, highlighted. He edits two sentences to sharpen the argument. The system notices the edit and quietly learns a little more of his style.

> **Behind the glass.** Drafting is grounded generation: the model drafts, but each
> assertion carries its evidence span, so "show me the source" is one click, not a
> hope. Tom's edits are new signal in the dogfooding flywheel (see the Vision, §7) —
> the corpus of his approved work is how the system comes to write like him.

## Scene 5 — He signs, and the record remembers why

Tom reviews the candidate set — the extracted deadline, the distinctions, the amended claim language, the draft response — in one approval view. He accepts most, rejects one weak argument, tweaks another. He hits **approve**.

Only now does any of it become part of the practice's permanent memory. And when it does, it carries its whole story: what was claimed, the evidence span behind it, that *Tom* approved it, and when. Six months from now, "why did we make this argument?" has an answer with a receipt.

> **Behind the glass.** Approval is the promotion gate. Accepted records join the
> authority spine — typed claims + evidence + provenance + lifecycle, the
> authoritative memory primitive (`goals/agentic-professional-runtime/docs/runtime-data-loop.md`).
> The graph view, the search index, and any future GraphRAG answer are **projections**
> rebuilt from that accepted truth, never a second source of it
> ([BeepGraph](./BEEPGRAPH_ARCHITECTURE.md)). Everything happened on Tom's machine; the
> client's file never left it.

---

## What just happened (the loop)

```
PDF dropped in
   └─► read & structured            (md / pandoc-ast / nlp-mcp)
   └─► claims grounded to spans      (langextract → evidence)
   └─► portal links surfaced         (artifact-ref: claim ↔ spec ↔ figure)
   └─► distinctions proposed         (candidate claims, NOT yet facts)
   └─► draft written in his voice    (grounded generation + style corpus)
   └─► Tom reviews & approves        (strict human gate)
   └─► proven facts join the graph   (authority spine; everything local)
```

Ingest → extract → ground → portal → draft → **approve** → proof. The same runtime
data loop the product is built on, walked once, on a real piece of work.

## Coda — an ordinary Tuesday

It isn't always an Office Action. Most days are smaller, and the workbench earns its keep in the margins:

- A prospect emails asking about trademark availability. The system drafts a reply in Tom's tone and reminds him it's still *his* to send.
- Before the intake call, Tom asks, "what do we already know about this company?" — and gets an answer assembled from old matters and emails, each point clickable to its source.
- A new client comes in; a conflict check runs across every walled matter in seconds and comes back clean — a query Tom could never have run reliably from memory.
- At 6pm, the librarian has quietly filed the day's correspondence into the right matters, flagged one deadline moving up, and left tomorrow's prep on top of the pile.

None of it is dramatic. All of it is *proven*. And every night, the practice knows a little more of what Tom knows.

---

*User story · the boundary converts confidence into provenance · the attorney always signs.*
