# court-pdf-layout-extraction

Scope: PACER/court PDF header-stamp isolation (pdfplumber font/position filter), docket document-number regex for filing->docket provenance, and per-jurisdiction caption-line column alignment — grounded in the canonical Free Law Project `doctor` implementation, with porting/coordination notes for `goals/file-processing-capability` + the `tika` driver.

## Findings

### The canonical source: Free Law Project `doctor`, BSD-2-Clause (port-friendly)

- The CAPTURE nuggets doctor#4 (caption alignment) and doctor#5 (header-stamp document number) come from **`freelawproject/doctor`**, a microservice that wraps pdfplumber/pdfminer/tesseract for court-document text extraction. Its license is **BSD 2-Clause, "Copyright (c) 2020, Free Law Project"** (https://github.com/freelawproject/doctor/blob/main/LICENSE). This is **permissive** — unlike the AGPL `mike` and unknown-license `harvest-mcp` nuggets in CAPTURE, the doctor algorithms may be ported with attribution rather than clean-room reimplemented. (Still: port the *algorithm*, not the Python runtime — see porting notes.)
- The current `main` implementation differs slightly from the CAPTURE snapshot; the **live functions are `get_header_stamp` + `get_document_number_from_pdf` in `doctor/tasks.py` and `adjust_caption_lines` in `doctor/lib/text_extraction.py`** (https://raw.githubusercontent.com/freelawproject/doctor/main/doctor/tasks.py, https://raw.githubusercontent.com/freelawproject/doctor/main/doctor/lib/text_extraction.py). CAPTURE's `get_header_stamp (font OR y0>750)` is verbatim-accurate; verify line numbers at port time since `main` has drifted.

### Header-stamp isolation: pdfplumber `.filter()` predicate on font name OR y0 position

- The exact current-`main` predicate (https://raw.githubusercontent.com/freelawproject/doctor/main/doctor/tasks.py):
  ```python
  def get_header_stamp(obj: dict) -> bool:
      # This option works for most juridictions except for ca5
      if "LiberationSans" in obj.get("fontname", ""):
          return True
      # Exception for ca5
      return obj["y0"] > 750
  ```
  Used as `f.pages[0].filter(get_header_stamp).extract_text()`. `Page.filter(test_fn)` returns a `FilteredPage` keeping only `.objects` for which the predicate is `True`, and `extract_text()` then collates only those chars (https://github.com/jsvine/pdfplumber#filtering-objects).
- **Why the font name works:** CM/ECF stamps the case/document header onto filed PDFs in a distinct font; in PACER PDFs that header text is rendered in a **LiberationSans** face that the document body does not use, so a substring match on `fontname` isolates the stamp. Free Law Project independently confirms the LiberationSans tag is the stamp's fingerprint: in a courtlistener dedup bug, "only the tag for LiberationSans changes across instances of the PDF" (https://github.com/freelawproject/courtlistener/issues/6634).
- **Why `y0 > 750` is the fallback:** pdfplumber's coordinate origin is the **bottom-left** of the page; `y0` is "Distance of bottom of character from bottom of page," increasing **upward**, in PDF points (72/inch) (https://github.com/jsvine/pdfplumber). A US-Letter page is 792 pt (11in × 72); `y0 > 750` selects chars in the **top ~0.58 inch** — exactly where the stamp sits. The doctor comment names **ca5 (Fifth Circuit)** as the jurisdiction whose stamp is *not* LiberationSans, hence the positional fallback. **Adversarial caveat:** the font-name branch returns `True` for any LiberationSans char *anywhere* on the page, so it does not double-check `y0`; if a body uses LiberationSans the filter over-captures (port should AND the two, or prefer top-band position).
- **Versioning/miss-discipline:** `get_document_number_from_pdf` returns `""` when no stamp/number is found — i.e. "a miss is an absent row, never a wrong fact." Unlike doc-haus, **doctor exposes no `VERSION` constant on these functions** (the text-extraction module has none — https://raw.githubusercontent.com/freelawproject/doctor/main/doctor/lib/text_extraction.py); the versioned re-extraction migration is a beep-side addition, not inherited.

### Docket document-number regex (Document / Doc / DktEntry variants)

- Current-`main` regex (https://raw.githubusercontent.com/freelawproject/doctor/main/doctor/tasks.py):
  ```python
  regex = r"Document:(.[0-9.\-.\#]+)|Document(.[0-9.\-.\#]+)|Doc:(.[0-9.\-.\#]+)|DktEntry:(.[0-9.\-.\#]+)"
  document_number_matches = re.findall(regex, header_stamp)
  ```
  Four alternations cover the label variants seen across courts: **`Document:`** (appellate CM/ECF), **`Document`** (district CM/ECF, no colon), **`Doc:`**, and **`DktEntry:`** (used by some appellate/9th-cir-style stamps). `re.findall` with multiple groups returns tuples per match; downstream code coalesces the one non-empty group into the number string.
- **Provenance link semantics:** the stamp number is the CM/ECF **document/docket-entry number** — the key that ties a filed PDF back to its row in the docket. The Administrative Office documents that every e-filed document carries a "unique electronic document stamp" in the NEF (district/bankruptcy) / NDA (appellate) and on the filed pages, alongside case number, doc number, and filing date (https://pacer.uscourts.gov/help/faqs/files-pleading-court-automatically-serve-notification, https://www.alsd.uscourts.gov/news/pageid-feature-cmecf-updated). That is the `filing -> docket` provenance edge the regex recovers.
- **Regex quirks to fix on port (adversarial read of the pattern):** (1) the leading `.` before each char-class matches one arbitrary char (usually the space after the label) and is *captured*, so the raw group is e.g. `" 482"` and needs trimming; (2) the class `[0-9.\-.\#]` lists `.` twice (redundant) and allows `.`, `-`, `#` so it captures dotted/hyphenated/hashed numbers but the loose `.` can over-match; (3) order matters — `Document:` must precede bare `Document` so the colon variant wins. A TS port should anchor the label, drop the stray leading `.`, and prefer a tighter `[0-9.#-]+`.
- **Stamp-format grounding (partially UNVERIFIED):** the regex shape implies two dominant layouts — district: `Case <num> Document <N> Filed <date> Page <x> of <y> PageID #: <n>`; appellate: `Case: <NN-NNNN> Document: <00############> Page: <N> Date Filed: <MM/DD/YYYY>` (the ~11-digit appellate "Document:" id). uscourts/PACER pages confirm the *fields* (case#, doc#, filing date, PageID Bates-style id — https://www.alsd.uscourts.gov/news/pageid-feature-cmecf-updated) but I could **not pull a verbatim literal stamp string** from a primary web-text source (the examples live inside filed PDFs). The exact appellate 11-digit `Document:` format is **UNVERIFIED** from a second primary source beyond the regex itself.

### Per-jurisdiction caption-line column alignment (§ TX, : NY, ) generic)

- Full current-`main` function (https://raw.githubusercontent.com/freelawproject/doctor/main/doctor/lib/text_extraction.py):
  ```python
  def adjust_caption_lines(page_text: str) -> str:
      """Adjust the alignment of ) or : or § used to align content
      § is used in texas courts
      : is used in NY courts
      ) is used in many courts
      """
      for separator in [r")", "§", ":"]:
          pattern = rf"(.* +{re.escape(separator)} .*\n)"
          matches = list(re.finditer(pattern, page_text))
          central_matches = [
              match.group().rindex(separator)
              for match in matches
              if 30 <= match.group().rindex(separator) <= 70
          ]
          if len(central_matches) < 3:
              continue  # Skip this separator if less than 3 matches found
          longest = max(central_matches)
          page = []
          for row in page_text.splitlines():
              index = row.find(f" {separator}")
              addition = (longest - index) * " "
              row = row.replace(f" {separator}", f"{addition}{separator}")
              page.append(row)
          return "\n".join(page)
      return page_text
  ```
- **The TX `§` / NY `:` / generic `)` mapping is documented in the doctor docstring itself** — so CAPTURE doctor#4's jurisdiction labels are source-grounded, not the author's guess. (My initial WebSearch found no court rule mandating these glyphs; the mapping is doctor's empirical observation, not a codified standard — treat as heuristic, **UNVERIFIED against an official jurisdiction style rule**.)
- **Algorithm shape (port faithfully):** it tries separators in fixed order `[")", "§", "<colon>"]`, returning on the **first** separator that has **≥3** occurrences whose rightmost index falls in the **central band [30,70]** (the caption's middle "column" between party names and case metadata). It then pads spaces so every separator aligns to the `longest` column. **Pre-req:** this operates on spatially-faithful text — doctor extracts the page with `page.extract_text(layout=True, keep_blank_chars=True, y_tolerance=5, y_density=25)`, where `layout=True` reproduces on-page spacing using `x_density`/`y_density` (https://github.com/jsvine/pdfplumber). Without layout-mode text, the column-index logic (`rindex`, `30<=i<=70`) is meaningless. The `keep_blank_chars` arg is documented as an `extract_words` arg; doctor passes it through its extraction path.
- **Caveat:** the `)` branch runs first and will fire on any document with ≥3 parenthetical separators in the central band, even non-caption parentheticals — so it can mis-align prose. The `<3` guard is the only safety; a port may want to confine this to page-1 caption region.

### Coordination with `goals/file-processing-capability` + the `tika` driver

- The repo's `file-processing` capability (`packages/foundation/capability/file-processing`) ships a **`tika` driver**, and per the live tree snapshot **OCR / PDF-diagnostics is SPEC-DEFERRED scope** for `goals/file-processing-capability` (tree-snapshot.md L13). Header-stamp/caption work is exactly that deferred layout-extraction lane.
- **Hard coordination gotcha — Tika cannot do this filter at its default text layer.** Apache Tika (built on PDFBox) emits **plain text + metadata** and abstracts away per-character font/position; per-char font name and bbox live in PDFBox's `TextPosition` (`writeString(...)`), reachable only by subclassing the PDF stripper, **not** via Tika's high-level text/XHTML output (https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=109454066, https://github.com/apache/tika/blob/master/tika-parsers/src/main/java/org/apache/tika/parser/pdf/AbstractPDF2XHTML.java, https://robinhowlett.com/blog/2019/11/29/parsing-structured-data-complex-pdf-layouts/). So the `LiberationSans`/`y0>750` predicate **cannot ride on the existing tika driver's output** — this feature needs a layout-aware extractor that exposes char-level `{fontname, x0, y0, x1, y1, size}`, which is the pdfplumber/pdfminer surface, not Tika's.
- **TS-port reality (no pdfplumber in a JS/Effect repo):** pdfplumber is **pure-Python (v0.11.10, 2026-06-15, MIT), built on pdfminer.six + Pillow** (https://pypi.org/project/pdfplumber/) — not portable into the TS runtime. The JS-native equivalent is **`pdf.js getTextContent`**, where each text item exposes `str`, `width`, `height`, `fontName`, and a `transform` matrix with `transform[4]=x`, `transform[5]=y` in PDF user-space (origin bottom-left) — enough to reconstruct the `y0`/font predicate (https://github.com/mozilla/pdf.js/issues/12031). **Two pdf.js gotchas:** (1) `fontName` is an internal style id (e.g. `g_d0_f1`), **not** the literal `"LiberationSans"` — the real face requires a `commonObjs`/font-object lookup; (2) `getTextContent` is documented to **lose some `fontName` transitions** that the viewer still renders correctly (https://github.com/mozilla/pdf.js/issues/7297), so font-based stamp detection on pdf.js is lower-fidelity than pdfplumber's pdfminer path. A more faithful non-Python route is poppler `pdftotext -bbox`/`-bbox-layout` or PDFBox `TextPosition` (JVM) for exact `y0`. Decide the extractor backend before adopting the predicate.

## Sources

- Free Law Project `doctor` — `tasks.py` (`get_header_stamp`, `get_document_number_from_pdf`): https://raw.githubusercontent.com/freelawproject/doctor/main/doctor/tasks.py
- Free Law Project `doctor` — `lib/text_extraction.py` (`adjust_caption_lines`, `extract_with_ocr`, `layout=True` extraction): https://raw.githubusercontent.com/freelawproject/doctor/main/doctor/lib/text_extraction.py
- Free Law Project `doctor` — LICENSE (BSD 2-Clause, Copyright 2020 Free Law Project): https://github.com/freelawproject/doctor/blob/main/LICENSE
- freelawproject/courtlistener issue #6634 (LiberationSans tag is the PACER stamp fingerprint; dedup): https://github.com/freelawproject/courtlistener/issues/6634
- pdfplumber repo (char props incl. `y0`/`fontname`, coordinate system, `.filter()`, `extract_text(layout=...)`): https://github.com/jsvine/pdfplumber
- pdfplumber PyPI (v0.11.10, 2026-06-15; MIT; pure Python; pdfminer.six/Pillow): https://pypi.org/project/pdfplumber/
- PACER/AO — electronic document stamp in NEF/NDA: https://pacer.uscourts.gov/help/faqs/files-pleading-court-automatically-serve-notification
- US District Court (S.D. Ala.) — PageID/CM-ECF header fields (case#, doc#, filing date, PageID): https://www.alsd.uscourts.gov/news/pageid-feature-cmecf-updated
- US Courts — Electronic Filing CM/ECF overview: https://www.uscourts.gov/court-records/electronic-filing-cm-ecf
- Apache Tika — PDFParser (PDFBox) wiki: https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=109454066
- Apache Tika source — `AbstractPDF2XHTML.java`: https://github.com/apache/tika/blob/master/tika-parsers/src/main/java/org/apache/tika/parser/pdf/AbstractPDF2XHTML.java
- PDFBox `TextPosition` for structured layout (robinhowlett): https://robinhowlett.com/blog/2019/11/29/parsing-structured-data-complex-pdf-layouts/
- mozilla/pdf.js #12031 (transform x/y meaning): https://github.com/mozilla/pdf.js/issues/12031
- mozilla/pdf.js #7297 (getTextContent loses fontName transitions): https://github.com/mozilla/pdf.js/issues/7297
- mozilla/pdf.js #5643 (retrieve bounding box of text): https://github.com/mozilla/pdf.js/issues/5643
- juriscraper PACER notes/utils (PACER mechanics, doc1 URLs): https://github.com/freelawproject/juriscraper/blob/main/juriscraper/pacer/notes.md

## Open / Unverified

- **Literal stamp string format** (district `Case … Document N Filed … Page x of y PageID #: n` vs appellate `Case: NN-NNNN Document: 00############ … Date Filed: MM/DD/YYYY`): the *fields* are AO-confirmed but the exact verbatim layout — especially the **~11-digit appellate `Document:` id** — is **UNVERIFIED** beyond the doctor regex; the examples live inside filed PDFs not surfaced in web text. Pull a few real PACER PDFs to confirm before locking regex constants.
- **TX `§` / NY `:` / generic `)` jurisdiction mapping**: source-grounded only in doctor's docstring (empirical), **not** confirmed against an official Texas/NY court style rule. Treat as heuristic; do not assert it as a codified standard.
- **`DktEntry:` provenance**: which courts emit `DktEntry:` vs `Document:` is not separately verified; the regex handles both but the per-court distribution is unconfirmed.
- **`y0 > 750` vs page size**: the 750 threshold assumes 792-pt US-Letter pages; legal-size (1008 pt) or rotated pages would shift the top band. Port should compute the threshold from `page.height`, not hardcode 750.
- **`LiberationSans` over-capture**: the font branch ignores position, so it can grab body text on documents that happen to use LiberationSans; not observed failing in doctor but unguarded. Recommend AND-ing font with a top-band `y0` check on port.
- **doctor line numbers**: CAPTURE cites `tasks.py:673-691` / `text_extraction.py:100-129`; `main` has drifted (function names confirmed, line numbers not). Re-locate at port time.
