# lawyergpt  `[T2]`

- **Purpose:** Full-stack RAG legal-research assistant for Nigerian law: Next.js chat UI + Go ingestion API (PDF/DOCX/OCR -> chunks -> Gemini embeddings -> pgvector) with tool-calling retrieval over court judgments.
- **Stack:** TypeScript (Next.js, Vercel AI SDK, Drizzle, Zod, Unkey ratelimit) + Go (net/http, GORM, gosseract OCR, pdfcpu/ledongthuc pdf, gooxml docx, goquery scraper) + PostgreSQL/pgvector + Google Gemini.
- **Size / shape:** Small (~915 LOC across TS/Go/MD; ~80 tracked files). Kind: web app (Next.js frontend) + Go HTTP ingestion API + standalone Go scraper CLI.
- **License:** unknown
- **Maturity:** Last commit 2026-05-23; project self-described as "paused" due to hosted-model/infra costs. Recent but not actively developed.

**Notes:** This is a generic RAG chatbot architecture, mostly adjacent to beep-effect's provenance-grounded thesis. Critically, it embodies the ANTI-PATTERN beep deliberately rejects: the retrieval tool returns content chunks straight to the LLM ("if no relevant info, use your own knowledge") with no provenance spans, no candidate->approved gate, no logic/proof wall. Useful only as concrete reference for the ingestion/chunking/OCR plumbing and pgvector schema, not for any reasoning or provenance layer. Stack overlaps with beep (Drizzle, Zod, pgvector) but uses Next.js/Go rather than Effect/Bun/PGlite.

## Web enrichment
- **Status:** lawyergpt's hard external dependency is Google Gemini embeddings; that surface has shifted significantly. Older Gemini embedding models were decommissioned: embedding-001 / embedding-gecko-001 / gemini-embedding-exp-03-07 shut down Oct 2025, and text-embedding-004 was shut down Jan 14, 2026. Any code pinning embedding-001 or text-embedding-004 will now 404/error; the current GA text model is gemini-embedding-001 (3072-dim, Matryoshka-truncatable, task_type-aware), with gemini-embedding-2-preview (Mar 2026, multimodal) for newer work. gemini-embedding-001 outputs 3072 dims by default vs 768 for the old models, so the pgvector column dimension and HNSW index must match the chosen output_dimensionality. The TS side (Vercel AI SDK tool-calling RAG route) is on a moving target: AI SDK 5 changed tool-loop control (maxSteps replaced by stopWhen, plus prepareStep), and AI SDK 6 unified generateObject/generateText. Go ingestion stack (gosseract/Tesseract OCR, pdfcpu, gooxml, goquery, GORM, pgvector HNSW) is stable with no decommissions. The flagged "un-gated tool-calling RAG" nugget remains valid as an anti-pattern reference (returns raw chunks rather than typed claim+evidence spans).</statusNotes>
<deprecations">Gemini embedding-001, embedding-gecko-001, and gemini-embedding-exp-03-07 were shut down in October 2025 — pins to these now fail.</deprecations>
</invoke>


## Gold nuggets (6)

### 1. PDF/DOCX/image ingestion with OCR fallback + panic-isolated parsing
`data-ingestion` · relevance: **adjacent** · verified

Go pipeline that switches on file extension, parses PDF text and falls back to rasterizing pages to PNG and running Tesseract OCR when text extraction fails or yields nothing; DOCX via gooxml; images via OCR. Each parser wraps work in deferred recover() so a malformed file cannot crash the worker goroutine. Directly relevant to beep's document-ingestion drivers which must handle scanned patent/office-action PDFs where digital text extraction silently returns empty.

- **Source:** `api/pkg/main.go:61-168`
- **beep-target:** @beep/md / document-ingestion drivers (PDF text-vs-OCR fallback strategy)

```
err := api.ExtractImagesFile(pdfPath, outputDir, nil, nil)
...
imageFiles, err := filepath.Glob(filepath.Join(outputDir, "*.png"))
...
client := gosseract.NewClient()
...
if content == "" {
	return "", fmt.Errorf("no content extracted from PDF")
}
```

### 2. Bounded-concurrency async ingestion with semaphore + per-file transaction
`effect-ts` · relevance: **serendipitous** · verified

Upload handler returns 202 immediately then processes files in a goroutine pool sized to ceil(n/2) via a channel semaphore; each chunk's resource+embedding insert is wrapped in its own DB transaction. A clean concurrency-control pattern to mirror in an Effect Stream/Workflow with bounded parallelism and per-item transactional persistence for the candidate ingestion stage.

- **Source:** `api/main.go:176-298`
- **beep-target:** Effect Stream.mapEffect concurrency model for ingestion workflows

```
numSemaphore := int(math.Ceil(float64(len(files)) / 2.0))
sem := newSemaphore(numSemaphore)
...
wg.Add(1)
sem.acquire()
go func(fileHeader *multipart.FileHeader) {
	defer sem.release()
	defer wg.Done()
```

### 3. pgvector HNSW cosine-similarity schema + thresholded top-k retrieval (Drizzle)
`data-ingestion` · relevance: **adjacent** · adjusted

Drizzle schema (embeddings.ts L5-20) declares a 768-dim vector column with an HNSW vector_cosine_ops index; the matching retrieval helper findRelevantContent lives in a separate file frontend/src/lib/ai/embedding.ts and computes cosine similarity in raw SQL (1 - cosineDistance), filters by gt(similarity, 0.25) and limits to 8. beep uses PGlite+Drizzle as local authority; near drop-in reference for the vector-search projection layer (beep keeps vectors as projection, not authority, and would attach provenance spans to each returned chunk).

- **Source:** `frontend/src/lib/db/schema/embeddings.ts:5-20`
- **beep-target:** PGlite+Drizzle vector projection / @beep/langextract retrieval index

```
embedding: vector("embedding", { dimensions: 768 }).notNull(),
...
embeddingIndex: index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
```

### 4. Vercel AI SDK tool-calling RAG route (the un-gated pattern beep rejects)
`mcp-design` · relevance: **adjacent** · verified

streamText with a single getInformation tool whose execute embeds the question and returns matched chunks, maxSteps:3, then persists user+assistant messages onFinish. Records the exact RETRIEVAL-feeds-LLM-directly design beep's hard wall forbids: no span provenance, no candidate->approved gate. Useful as a negative reference and as a Zod tool-definition shape to re-implement under @effect-rpc with provenance-carrying outputs.

- **Source:** `frontend/src/app/api/chat/[id]/route.ts:50-58`
- **beep-target:** @beep/nlp-mcp tool definitions (contrast: must emit CandidateClaim+Evidence spans, not raw chunks)

```
getInformation: tool({
	description: "get information from your knowledge base to answer questions.",
	parameters: z.object({
		question: z.string().describe("the users question"),
	}),
	execute: async ({ question }) => findRelevantContent(question),
}),
```

### 5. Configurable CSS-selector legal-corpus scraper (NigerianLII judgments)
`data-ingestion` · relevance: **serendipitous** · verified

Standalone Go CLI scrapes a configurable list of source URLs, extracts main content via a configurable goquery CSS selector (default .content-and-enrichments), batches results in groups of 5 and POSTs to the API with an x-api-key header. Concrete pattern for a jurisdiction-specific case-law harvesting driver; the env-driven URL list + selector design generalizes to other LII/court sites beep may ingest.

- **Source:** `extractor/main.go:64-93`
- **beep-target:** case-law scraping driver (config-driven selector + batched POST ingestion)

```
func contentSelector() string {
	selector := strings.TrimSpace(os.Getenv("EXTRACTOR_SELECTOR"))
	if selector == "" {
		return ".content-and-enrichments"
	}
	return selector
}
```

### 6. Rune-aware fixed-size text chunker
`provenance-evidence` · relevance: **adjacent** · verified

ChunkText splits on rune boundaries (not bytes) at a fixed size, avoiding multibyte truncation; callers use 7500 chars for files and 4000 for scraped text. Simple, correct baseline chunker. beep's span-grounded extraction needs offset-preserving chunking, so this is a starting point that would need byte/char offset tracking added to support provenance spans.

- **Source:** `api/pkg/main.go:21-35`
- **beep-target:** @beep/langextract chunking (add char-span offsets for provenance)

```
runes := []rune(text)
for len(runes) > 0 {
	if len(runes) > chunkSize {
		chunks = append(chunks, string(runes[:chunkSize]))
		runes = runes[chunkSize:]
	} else {
		chunks = append(chunks, string(runes))
		break
	}
}
```
