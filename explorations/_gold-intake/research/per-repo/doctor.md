# doctor  `[T1]`

- **Purpose:** Free Law Project's HTTP microservice (CourtListener "Doctor") for extracting text from legal documents (PDF/DOC/DOCX/WPD/HTML/TXT), OCR, MIME detection, PDF metadata stripping, bad-redaction detection, thumbnails, and audio conversion.
- **Stack:** Python 3.12, Django 6 + gunicorn/uvicorn (ASGI); pdfplumber, pdftotext, pytesseract/tesseract, ghostscript, pypdf, img2pdf, reportlab, magika + python-magic (libmagic), x-ray (redactions), eyed3 + ffmpeg (audio), httpx; uv for deps.
- **Size / shape:** ~3,500 LOC Python across ~12 source modules (74 files incl. test assets); a Dockerized Django HTTP microservice exposing ~15 document-processing endpoints.
- **License:** BSD-2-Clause
- **Maturity:** Active; last commit 2026-05-27, version 0.3.6 in pyproject.toml.

**Notes:** This is a document-conversion/extraction service, not an MCP server or schema library, so it contributes ingestion algorithms rather than data models or Effect/Schema code. Highly reusable for beep's PDF-to-text ingestion path (the hard problem before span-grounded extraction even begins). Several court-specific heuristics (Ninth Circuit skew, Texas/NY caption separators, ca9 mojibake, PACER header stamps) are legal-domain gold not found in generic OCR libraries. No direct overlap with beep's existing CourtListener/USPTO driver skeletons, since those are API clients while this is binary-document processing; the two are complementary.

## Web enrichment
- **Status:** doctor (freelawproject/doctor) is ACTIVE and healthy as of 2026: repo last updated May 2026, in continuous production at Free Law Project where it has processed tens of millions of documents and 2.5M+ minutes of audio. It is an internal HTTP microservice (gunicorn -> Django, wrapping pdftotext, tesseract, ghostscript, ffmpeg, etc.) with NO built-in authentication or API keys — it is meant to run on a trusted internal network behind CourtListener, not exposed publicly. No deprecations or auth breakage on doctor itself. Key dependencies are all current and maintained: Google Magika reached stable v1.0 (Rust core CLI + Python/JS/Go bindings; ~1MB Keras model, ~99% precision, ICSE 2025 paper) so the Magika+libmagic+magic-byte cascade nugget is sound; x-ray (BSD, on PyPI) is the canonical bad-redaction detector (finds rectangles, checks text underneath, renders to confirm solid fill) and matches the nugget's wrapper description; eyecite (separate FLP lib, not bundled in doctor) is current and uses Hyperscan for high-throughput tokenization. The cross-cutting topics (USPTO/PatentsView, EPO OPS, OWL reasoners, FalkorDB, BAML, FastMCP, FRBR/PROV-O, OpenCode) are not part of doctor's stack and were not relevant to verify here.</statusNotes>
<deprecations>["doctor exposes NO authentication on its HTTP endpoints by design — never expose it directly to the public internet; gate it behind an internal network / reverse proxy. Any BEEP integration must front it with its own auth layer.","Magika's JS/TS npm binding is still labelled experimental upstream; for a TS-native @beep ingestion path, prefer calling the stable Rust CLI or Python API rather than depending on the JS package for production file-typing.","x-ray detects only the common 'black rectangle over text' class of bad redaction (rect + extractable text underneath); it does NOT catch redactions where text was actually removed or rasterized — treat a clean x-ray result as necessary-not-sufficient for a confidentiality gate.","pdftotext / tesseract / ghostscript behavior is version- and locale-sensitive; doctor pins carefully configured binaries in its Docker image, so reproducing its extraction/OCR output requires matching those binary versions, not just the Python wrappers."]</deprecations>
<upstreamDocs>[{"url":"https://github.com/freelawproject/doctor","note":"Canonical repo: endpoint list (/extract/doc/text, /utils/page-count, /utils/mime-type, /utils/audio/convert, /utils/file/extension, /utils/add/text-to-pdf, bad-redaction check) and Docker deployment."},{"url":"https://free.law/projects/doctor/","note":"FLP project page confirming current capability set and production scale."},{"url":"https://github.com/google/magika","note":"Magika v1.0 stable; Rust CLI + Python/JS/Go bindings, ~1MB model, Apache-2.0 — basis for the MIME-detection cascade."},{"url":"https://github.com/freelawproject/x-ray","note":"x-ray bad-redaction detector: inspect() API, bbox+text JSON output, BSD license."},{"url":"https://github.com/freelawproject/eyecite","note":"eyecite citation parser (Hyperscan-backed, two-step reference resolution) — the FLP legal-NLP counterpart for caption/citation nuggets."},{"url":"https://opensource.googleblog.com/2024/02/magika-ai-powered-file-type-identification.html","note":"Google's design rationale for content-based (vs magic-byte) file typing — supports the layered detection nugget."}]</upstreamDocs>
<corrections>[{"nuggetTitle":"Robust MIME/extension detection: Magika + libmagic + magic-byte fallbacks","correction":"Confirmed sound. Magika is now stable v1.0 (was experimental at doctor's adoption). For a TS/@beep port, drive Magika via the Rust CLI or Python API; the npm JS binding remains experimental upstream. The Magika+libmagic+magic-byte fallback ordering remains best practice since Magika is content/ML-based and complements (not replaces) deterministic magic-byte checks."},{"nuggetTitle":"Bad-redaction detection (x-ray) wrapper","correction":"Scope-limit the governance claim: x-ray (FLP, BSD) only flags rectangles/highlights drawn over still-extractable text. It cannot detect redactions where the underlying text was truly deleted or the page rasterized. As a pre-ingestion confidentiality check it should be framed as a high-recall heuristic for one failure mode, not a guarantee of proper redaction."},{"nuggetTitle":"Upload-lifecycle observability decorator (request_id + logfmt + size)","correction":"Note that doctor itself ships with no authentication, so the observability/tracing layer is also the de facto security boundary at the app edge — any @beep adoption should pair the tracing decorator with an explicit auth/authorization front (doctor assumes a trusted internal network)."},{"nuggetTitle":"Court caption-line alignment (Texas §, NY :, generic ))","correction":"For the citation/caption side of @beep/law-practice, prefer reusing Free Law Project's eyecite (Hyperscan-backed, tested on 50M+ citations, now with two-step reference resolution) rather than reimplementing citation parsing; doctor's caption alignment is layout heuristics only and is upstream of, not a substitute for, eyecite."}]</corrections>
</invoke>


## Gold nuggets (12)

### 1. Layout-aware PDF text extraction with margin crop + skew filtering
`data-ingestion` · relevance: **direct** · verified

get_page_text uses pdfplumber with layout=True and crops top/bottom margins for portrait pages, while filtering out skewed text (circular stamps, perpendicular Ninth-Circuit text) via the current transformation matrix (is_skewed). beep needs exactly this deterministic text layout to compute stable character spans for provenance; layout-preserving extraction keeps offsets meaningful.

- **Source:** `doctor/lib/text_extraction.py:32-69`
- **beep-target:** @beep/langextract / @beep/provenance PDF ingestion (span-grounded extraction precursor)

```
page_text = (
    page.crop(bbox)
    .filter(is_skewed)
    .extract_text(
        layout=True,
        keep_blank_chars=True,
        y_tolerance=5,
        y_density=25,
    )
)
```

### 2. Heuristic deciding when a PDF page needs OCR
`data-ingestion` · relevance: **direct** · verified

page_needs_ocr flags a page for OCR when text is empty, contains '(cid:' (broken font maps), has FreeText/Widget annotations, embedded images, or many curves. A cheap, reliable gate that lets beep run fast text extraction first and fall back to expensive OCR only when warranted - critical for a local-first desktop where OCR is costly.

- **Source:** `doctor/lib/text_extraction.py:132-145`
- **beep-target:** @beep/langextract OCR-gating in document ingestion pipeline

```
return (
    page_text.strip() == ""
    or "(cid:" in page_text
    or has_text_annotations(page)
    or has_images(page)
    or len(page.curves) > 10
)
```

### 3. OCR confidence-based artifact suppression
`provenance-evidence` · relevance: **direct** · verified

get_word maps Tesseract per-word confidence + margin position into a decision: keep, blank out (margin artifacts/zero-conf), or replace with box glyphs for uncertain stamp/caption text. This is a tuned, real-world recipe for separating reliable OCR from noise - directly aligned with beep's retrieval/logic wall: low-confidence OCR should never silently become an authoritative fact.

- **Source:** `doctor/lib/text_extraction.py:285-320`
- **beep-target:** @beep/epistemic Evidence confidence scoring for OCR-sourced candidate claims

```
no_confidence = 0
very_low_confidence = 5
low_confidence = 40
short_word_len = 3
long_word_len = 20
if (
    word_dict["left"] + word_dict["width"] < left_margin
    and conf < low_confidence
):
    word = " " * len(word)
```

### 4. Court caption-line alignment (Texas §, NY :, generic ))
`legal-nlp` · relevance: **adjacent** · verified

adjust_caption_lines re-aligns the vertical separator column in legal document captions, with documented per-jurisdiction separators (§ Texas, : NY, ) most courts). A concrete legal-NLP normalization that improves downstream parsing of case captions - useful when beep parses the styled caption of an opinion or office action.

- **Source:** `doctor/lib/text_extraction.py:100-129`
- **beep-target:** @beep/law-practice caption/party parsing normalization

```
for separator in [r")", "§", ":"]:
    pattern = rf"(.* +{re.escape(separator)} .*\n)"
    matches = list(re.finditer(pattern, page_text))
```

### 5. PACER/court document-number extraction from PDF header stamp
`legal-nlp` · relevance: **direct** · verified

get_header_stamp (font/position pdfplumber filter) plus get_document_number_from_pdf isolates the court-applied header stamp and regex-extracts the docket document number across Document:/Doc:/DktEntry: variants. Reusable parser for grounding a court filing to its docket entry - feeds beep's provenance/citation linkage.

- **Source:** `doctor/tasks.py:673-691`
- **beep-target:** @beep/law-practice docket/document-number parsing; @beep/provenance source linkage

```
regex = r"Document:(.[0-9.\-.\#]+)|Document(.[0-9.\-.\#]+)|Doc:(.[0-9.\-.\#]+)|DktEntry:(.[0-9.\-.\#]+)"
document_number_matches = re.findall(regex, header_stamp)
```

### 6. Robust MIME/extension detection: Magika + magic-byte fallbacks
`data-ingestion` · relevance: **direct** · adjusted

extract_mime_type runs Magika first, then corrects its known misclassifications via raw header signature sniffing (WordPerfect \xffWPC, ASF/WMA, %PDF-, FLAC/AAC/OGG/RealMedia). A battle-tested file-typing layer beep can lift wholesale for ingesting heterogeneous attorney/court files where extensions lie. (Note: snippet/lines confirmed exactly; the libmagic fallback claim is not visible in this view but a final extension fixup exists in extract_extension.)

- **Source:** `doctor/views.py:343-371`
- **beep-target:** @beep/md / ingestion drivers file-type detection

```
header = content[:64]
if mime in (
    "application/x-python-pickle",
    "application/octet-stream",
) and (header.startswith(b"\xffWPC") or b"WPC" in header[:8]):
    mime = "application/vnd.wordperfect"
elif header.startswith(b"\x30\x26\xb2\x75\x8e\x66\xcf\x11"):
```

### 7. PDF metadata stripping for content-addressable hashing
`provenance-evidence` · relevance: **direct** · verified

strip_metadata_from_bytes/strip_metadata_from_path blank /CreationDate and /ModDate so identical PDFs hash identically. Directly supports beep's provenance model: deterministic content hashes for source documents so re-ingesting the same file is idempotent and dedupable.

- **Source:** `doctor/lib/utils.py:265-278`
- **beep-target:** @beep/provenance / @beep/identity content-hash dedup for source docs

```
with PdfWriter() as pdf_merger:
    pdf_merger.append(io.BytesIO(pdf_bytes))
    pdf_merger.add_metadata({"/CreationDate": "", "/ModDate": ""})
    byte_writer = io.BytesIO()
    pdf_merger.write(byte_writer)
    return force_bytes(byte_writer.getvalue())
```

### 8. Bad-redaction detection (x-ray) wrapper
`governance-ops` · relevance: **serendipitous** · verified

get_xray wraps the x-ray library to detect text hidden under failed redaction boxes in PDFs, returning bounding boxes. Surprising but valuable for an IP attorney workbench: an ethical-wall / confidentiality guard that flags documents whose redactions can be recovered before they enter the graph or get shared.

- **Source:** `doctor/tasks.py:121-141`
- **beep-target:** @beep governance/ethical-wall pre-ingestion confidentiality check

```
def get_xray(path):
    try:
        bad_redactions = xray.inspect(path)
        return bad_redactions
    except (
        OSError, ValueError, TypeError, KeyError, AssertionError, PdfReadError,
    ):
        return {"error": True, "msg": "Exception"}
```

### 9. Mojibake repair table for corrupt court PDFs (pdfFactory / ca9)
`data-ingestion` · relevance: **serendipitous** · verified

fix_mojibake holds an empirically-built character substitution table that rescues garbled text from a specific broken PDF producer used by the Ninth Circuit. The detection trick ('e' absent => corrupt) lives in extract_from_pdf (tasks.py ~line 203). A domain artifact and ready remediation map for the court-specific corruption beep will hit ingesting real opinions.

- **Source:** `doctor/lib/mojibake.py:4-33`
- **beep-target:** @beep/langextract encoding-repair pass for legacy court PDFs

```
def fix_mojibake(text):
    """Given corrupt text from pdffactory, converts it to sane text."""
    letter_map = {
        "¿": "a", "¾": "b", "½": "c", "¼": "d", "»": "e",
        "º": "f", "¹": "g", "¸": "h", "·": "i",
```

### 10. Encoding-cascade extraction for legacy TXT/HTML court files
`data-ingestion` · relevance: **adjacent** · verified

extract_from_html (cited snippet) and extract_from_txt try a documented ordered cascade of encodings (utf-8/ISO8859/cp1252/latin-1), reflecting that most court text files were produced on Windows from WPD/DOC. Reusable decoding strategy for beep's text ingestion of old filings. (Cited line 353-363 is extract_from_html; extract_from_txt is at line 378+.)

- **Source:** `doctor/tasks.py:353-363`
- **beep-target:** @beep/md / ingestion text decoding utilities

```
for encoding in ["utf-8", "ISO8859", "cp1252", "latin-1"]:
    try:
        with open(path, encoding=encoding) as f:
            content = f.read()
        content = get_clean_body_content(content)
        content = force_text(content, encoding=encoding)
        return content, "", 0
```

### 11. Two-pass PDF extraction: pdftotext first, OCR only if longer/needed
`provenance-evidence` · relevance: **direct** · verified

extract_from_pdf orchestrates the full ingestion decision: run pdftotext, repair mojibake on corrupt files when OCR off, else if ocr_needed run OCR and keep whichever output is longer, tracking an extracted_by_ocr provenance flag. This is the exact orchestration shape beep wants - and the boolean lineage flag (human-rendered vs OCR-guessed text) maps straight to evidence provenance.

- **Source:** `doctor/tasks.py:197-218`
- **beep-target:** @beep/epistemic GroundedExtraction provenance flag (text vs OCR origin)

```
if ocr_needed(path, content):
    success, ocr_content = await extract_by_ocr(path)
    if success:
        if len(ocr_content) > len(content):
            content = ocr_content
            extracted_by_ocr = True
            returncode = 0
```

### 12. Upload-lifecycle observability decorator (request_id + logfmt + size)
`governance-ops` · relevance: **adjacent** · verified

log_upload_lifecycle wraps sync and async views to emit logfmt-safe start/end log lines with a short request_id, filename, content-type and byte size, to trace requests that never complete (OOM hunting). A clean, framework-agnostic tracing pattern beep can mirror around its ingestion/extraction tasks for deterministic CI and ops.

- **Source:** `doctor/lib/utils.py:417-444`
- **beep-target:** @beep observability/tracing around ingestion workflows

```
def log_upload_lifecycle(view):
    view_logger = logging.getLogger(view.__module__)
    view_name = view.__name__
    def _log_start(request) -> str:
        request_id = uuid.uuid4().hex[:8]
        upload = request.FILES.get("file")
```
