# legalmind-ai  `[T3]`

- **Purpose:** Browser-only React+Gemini demo that parses Taiwan court-judgment PDFs and drafts appeals/pleadings in Traditional Chinese, aimed at law-school teaching.
- **Stack:** TypeScript, React 18, Vite; @google/generative-ai (Gemini 1.5 flash/pro); pdfjs-dist for client-side PDF text extraction.
- **Size / shape:** ~3 TS service files (~600 LOC total) + React shell; client-side web app (GitHub Pages SPA).
- **License:** MIT
- **Maturity:** Last commit 2025-12-13; v1.0.0, single-author educational project, low activity.

**Notes:** Very small Taiwan-jurisdiction teaching demo. Uses Google Gemini (not Anthropic). Architecturally the opposite of beep's thesis: it ships raw LLM JSON straight to the user with no provenance spans, no candidate->approved gate, and no logic/retrieval wall. Almost nothing is directly reusable, but two small artifacts are worth noting as adjacent reference material.

## Gold nuggets (2)

### 1. VerdictAnalysis structured-extraction prompt schema
`legal-nlp` · relevance: **adjacent** · verified

A JSON-shaped prompt that forces an LLM to extract a fixed legal-analysis record (caseNumber, parties{plaintiff,defendant}, summary, keyFacts[], legalIssues[], judgeReasoning, strengths[], weaknesses[], suggestedStrategy) plus a required-field validation loop. Useful as a reference shape for beep's CandidateClaim extraction over court documents, though beep would express it as an effect/Schema and attach character-span provenance instead of free text. Jurisdiction is Taiwan, not US IP, so it's adjacent reference only.

- **Source:** `src/services/geminiService.ts:48-108`
- **beep-target:** @beep/langextract / epistemic CandidateClaim extraction schema

```
const requiredFields = ['caseNumber', 'parties', 'summary', 'keyFacts', 'legalIssues', 'judgeReasoning', 'strengths', 'weaknesses', 'suggestedStrategy'];
for (const field of requiredFields) {
  if (!analysisResult[field]) {
    throw new Error(`分析結果缺少必要字段: ${field}`);
  }
}
```

### 2. Client-side PDF text extraction + quality/garbage assessment
`data-ingestion` · relevance: **adjacent** · adjusted

PDFService extracts text page-by-page with pdfjs-dist (with cMap config for CJK fonts), cleans whitespace, then assessTextQuality() scores high/medium/low by word count, ratio of real letter chars (CJK + ASCII) vs total (gibberish detection), and a repeated-char regex. Flags low word counts and image-only scans. Useful heuristic for beep's data-ingestion to decide whether a PDF needs OCR before extraction, and to refuse low-quality input before it becomes a candidate claim.

- **Source:** `src/services/pdfService.ts:123-151`
- **beep-target:** foundation document-ingestion / PDF-to-text quality gate before extraction

```
const singleChars = text.split('').filter(char => /[一-龥a-zA-Z]/.test(char)).length;
const totalChars = text.length;
if (singleChars / totalChars < 0.5) {
  issues.push('可能包含亂碼或格式化問題');
  quality = quality === 'high' ? 'medium' : 'low';
}
if (/(.)\1{10,}/.test(text)) {
  issues.push('包含過多重複字符');
}
```
