# USPTO drawing validation — research digest (2026-10-14)

Deep-research run (Opus 5.5 workflow, 5 search angles, 20 sources fetched, 100 claims extracted, 25
verified by three adversarial votes each, 18 confirmed, 7 refuted, 11 findings after merge). The
question asked for the normative text, programmatic checkers, and practitioner checklists that let a
pipeline catch what an examiner would object to. Only the normative-text and Patent Center angles
survived verification; the checker-software and checklist angles are recorded below as gaps so the
next pass starts there. Scope ruling (operator, 2026-10-14): US only — 37 CFR 1.84, 37 CFR 1.152,
MPEP 1503.02 and the Patent Center PDF guidelines; Hague/EUIPO stay open questions.

## What this changes in the validator (follow-up PR, after the review loop)

Errors (rule text says *must*):

| Check | Rule | Status today |
| --- | --- | --- |
| Every sheet in a set is the same size (A4 or Letter) | 1.84(f) | `page-size-mixed` exists; keep |
| No frame or border drawn around the sight | 1.84(g) | new |
| Every numeral and letter at least 0.32 cm tall | 1.84(p)(3) | new (`label-height`) |
| FIG numbers are a gapless sequence from 1; a single view carries no "FIG." | 1.84(u) | new (`figure-sequence`) |
| No "scale", "actual size" or similar text | 1.84(k) | new (`scale-text`) |
| Lead lines never cross; each has one end at its character and one on geometry | 1.84(q) | new, utility sets only |
| Broken-line weight no heavier than the lightest claimed outline | MPEP 1503.02 III | new (`broken-weight`) |
| A broken-line edge whose source is occluded from the view is an error | 1.152 / 1503.02 III | new (`broken-hidden`) |
| Solid black only with a colour-black/contrast waiver backed by the description | 1.84(m), 1.152 | `solid-black-area` exists; add the waiver |
| PDF version at most 1.6 (header and catalog) and PDF/A-1b | Patent Center PDF guidelines | `pdf-version` exists; add catalog `/Version` and veraPDF when installed |
| Embedded fonts carry no Restricted-License `fsType` bit | Patent Center PDF guidelines | new, behind the embedded-text route |

Warnings (rule text says *should*, or no numeric threshold):

| Check | Rule |
| --- | --- |
| Legible at two-thirds reduction: raster at 2/3 and test that strokes, gaps and labels still resolve | 1.84(k) |
| Shading strokes thinner than outlines | 1.84(m) |
| Shade-side density greater on faces turned from an upper-left 45° light | 1.84(m) |
| Scan-target cross-hairs on two opposite corners | 1.84(g) |
| One shading type per surface; oblique lines on transparent or polished faces | MPEP 1503.02 II |

Who is the gate: the separate draftsperson review (form PTO-948) ended on 2012-10-25; OPAP screens
only reproducibility (MPEP 507 grounds A–G) and does not review design drawings for publication.
Design sets are judged by the examiner under 1.84, 1.152 and MPEP 1503.02, where missing or
misleading surface shading can draw 35 USC 112 rejections. Checks are calibrated to the examiner.

## Findings (verified)

### 1. [high] Sheet size and margins (37 CFR 1.84(f),(g), reproduced in MPEP 608.02 and the Patent Center PDF Guidelines). Only two sheet sizes are allowed, A4 (21.0 x 29.7 cm) or US Letter (21.6 x 27.9 cm), and every sheet in an application must be the same size. Minimum margins: top 2.5 cm (1 in), left 2.5 cm (1 in), right 1.5 cm (5/8 in), bottom 1.0 cm (3/8 in). The maximum sight is therefore 17.0 x 26.2 cm on A4 and 17.6 x 24.4 cm on Letter. Frames around the sight are prohibited (must not). Scan-target cross-hairs on two diagonally opposite margin corners are recommended (should). Patent Center reduces larger pages to 8.5 x 11 in.

Evidence: This merges claims 0, 5 and 10. All verifiers matched the eCFR text as of 2026-10-01 (via the renderer and versioner API) and MPEP 608.02 [R-01.2024] word for word. The sight limits follow arithmetically from the margins. Practitioner Carl Oppedahl reports that Patent Center's automatic resize of a slightly off-size PDF left a blank page in the Image File Wrapper, so emit exact A4 or Letter pages and never rely on the reduction. Checks this adds to the existing margin and page-size checks: (a) error if sheets in one application differ in size; (b) error if a border or frame is drawn around the sight; (c) warning, not error, if cross-hairs are missing, since 'should' is advisory.

Sources: https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFRc7605aa2d3f3782/section-1.84 · https://www.uspto.gov/web/offices/pac/mpep/s608.html · https://www.uspto.gov/patents/apply/applying-online/efs-web-pdf-guidelines · https://www.law.cornell.edu/cfr/text/37/1.84 · https://blog.oppedahl.com/?p=6112  (votes 3-0, 3-0, 3-0)

### 2. [high] Line quality and scale (1.84(l), 1.84(k)). Every line, number and letter must be durable, clean, black (except in color drawings), sufficiently dense and dark, uniformly thick and well-defined, and heavy enough for adequate reproduction. This applies to all lines, including fine lines, shading and section lines. Different thicknesses may be used only where the difference carries a meaning. The scale must avoid crowding when the drawing is reduced to two-thirds. Notations such as 'actual size' or 'scale 1/2' are forbidden.

Evidence: This merges claims 2 and 7. The verbatim text matches the eCFR and MPEP 608.02. Neither paragraph has been amended since 80 FR 17962 (2015). The US rule gives no numeric minimum line width. The 2/3 figure is tied to scale and crowding in (k), not to line weight in (l). A line-weight or minimum-feature test at 2/3 reduction is therefore a conservative engineering reading, not a stated threshold. (PCT Rule 11.13(c) and EPC Rule 46 tie line detail to 2/3 explicitly, but only verifier commentary supports that.) MPEP 608.02 says objections are generally made only if the Office cannot reproduce the drawing. Checks this adds: (a) per-stroke uniformity, meaning constant width along a single path, not one weight for the whole drawing; (b) render at 2/3 scale and test that strokes, gaps and labels still resolve; (c) error on any text matching scale or 'actual size' patterns; (d) restrict stroke widths to a declared set of meaningful weights.

Sources: https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFRc7605aa2d3f3782/section-1.84 · https://www.uspto.gov/web/offices/pac/mpep/s608.html  (votes 3-0, 3-0)

### 3. [high] Characters, view numbering and lead lines (1.84(p)(3), (u), (q)). Numbers, letters and reference characters must be at least 0.32 cm (1/8 in) tall. Views are numbered with consecutive Arabic numerals starting at 1, prefixed 'FIG.', independently of sheet numbering. View numbers must be larger than reference characters. A single view must not be numbered, and 'FIG.' must not appear on it. Lead lines must not cross each other (must), should be as short as possible (should), must start next to their reference character, reach the feature, and be drawn like the drawing's other lines.

Evidence: This merges claim 3 and the (p)(3) part of claim 7. Verified against the eCFR version of 2026-10-01 and against LII. Your pipeline checks label presence. Checks this adds: (a) rendered cap height of at least 0.32 cm for every text glyph; (b) FIG numbers are a gapless sequence starting at 1 and do not depend on sheet order; (c) FIG label height is greater than reference-character height; (d) a single-view set has no 'FIG.' label; (e) lead-line segment intersection is an error and excessive lead-line length is a warning; (f) each lead line has one endpoint near its character and the other on geometry.

Sources: https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFRc7605aa2d3f3782/section-1.84 · https://www.uspto.gov/web/offices/pac/mpep/s608.html · https://www.law.cornell.edu/cfr/text/37/1.84  (votes 3-0, 3-0)

### 4. [high] General shading rules (1.84(m)). Shading is encouraged when it aids understanding and does not reduce legibility. It shows the surface or shape of spherical, cylindrical and conical elements, and flat parts may be lightly shaded. Spaced lines are preferred. They must be thin, as few in number as practicable, and in contrast with the rest of the drawing. Light should come from the upper left at 45°. Heavy lines on the shade side may substitute for shading. None of these rules has a numeric threshold, so density and light-side tests must be heuristics the pipeline defines.

Evidence: This merges claims 1 and 6. The MPEP 608.02 text and the eCFR text are identical, and paragraph (m) has not changed since 2015. The design-specific context comes from MPEP 1503.02 [R-01.2024], as quoted by a verifier. 37 CFR 1.152 does not require surface shading, but shading may be necessary to show 3-D contour, and a lack of appropriate surface shading may make the design nonenabling and indefinite under 35 USC 112(a) and (b). Treat shading as optional only for flat or 2-D designs. Your pipeline already checks stroke spacing, outline clearance and lone lines. Checks this adds: (a) a light-direction heuristic, where shade-side density should be greater on surfaces whose normals face away from an upper-left 45° light, reported as a warning; (b) a contrast check that shading strokes are thinner than outline strokes; (c) a coverage check that every curved claimed surface (sphere, cylinder or cone from the CAD faces) carries contour shading.

Sources: https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFRc7605aa2d3f3782/section-1.84 · https://www.uspto.gov/web/offices/pac/mpep/s608.html · https://www.law.cornell.edu/cfr/text/37/1.84 · https://www.uspto.gov/web/offices/pac/mpep/s1503.html  (votes 2-1, 3-0)

### 5. [high] Solid black fills. 1.84(m) bans solid black shading areas except for bar graphs or color. For design drawings, 37 CFR 1.152 narrows the exception to the color black and color contrast, and MPEP 1503.02 and the USPTO Design Patent Application Guide restate the rule. A detector should flag filled black regions by default and accept only regions explicitly annotated as color black or contrast. That annotation should be backed by a matching statement in the specification. Strokes, glyphs, arrowheads and stipple dots must be excluded from the detector.

Evidence: This merges claims 4 and 11 and the solid-black parts of claims 1 and 6. The text of 1.152 has been stable since 65 FR 54674 (2000). The Guide was last modified 2025-04-21 and MPEP 1503.02 on 2026-03-09. The binding authority is 1.152; the Guide only restates it. According to a secondary summary, solid black used to suggest depth or an opening is not allowed; open and solid areas must instead be distinguished by surface shading. The bar-graph exception does not apply to design sets. Your pipeline already detects solid-black areas. The change is to add the annotation waiver and cross-check it against the specification text, and to confirm the detector targets only filled regions.

Sources: https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFR5ba9219fb1b6d20/section-1.152 · https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFRc7605aa2d3f3782/section-1.84 · https://www.uspto.gov/patents/basics/apply/design-patent · https://www.uspto.gov/web/offices/pac/mpep/s1503.html · https://www.law.cornell.edu/cfr/text/37/1.152  (votes 3-0, 3-0)

### 6. [high] Per-surface shading conventions for design drawings. Stippling and straight-line shading may both appear on one object to show contrast but should not be combined on the same surface. Oblique line shading must be used for transparent, translucent and highly polished or reflective surfaces, such as mirrors. Elements visible behind a transparent surface are drawn in light full lines, not broken lines.

Evidence: Claim 13, checked against the Guide (fetched 2026-10-14) and MPEP 1503.02 Part II. The oblique-line rule says 'must' in both sources. The no-mixing rule is a 'should' in the Guide only and is not codified in 1.84. Color lining with contour shading (MPEP 1503.02 Part V) is a separate convention and does not conflict. Checks this adds, given that the CAD faces carry material or finish tags: (a) each face has at most one shading type, stipple or line, reported as a warning; (b) faces tagged transparent, translucent or reflective must carry oblique hatching, reported as an error; (c) geometry seen through a transparent face is drawn as thin solid lines, never dashed.

Sources: https://www.uspto.gov/patents/basics/apply/design-patent · https://www.uspto.gov/web/offices/pac/mpep/s1503.html  (votes 3-0)

### 7. [high] Broken lines for unclaimed matter. Broken lines should not be heavier than the lines of the claimed design. They should not intrude on or cross the claimed design; where crossing is unavoidable and obscures the design, a separate figure is required. Broken lines may not show hidden planes or surfaces behind opaque material. The specification must state what the broken lines are for and describe unclaimed matter as forming no part of the claimed design.

Evidence: Claim 12, cross-checked against MPEP 1503.02 Part III and form paragraphs 15.50.01 and 15.50.04. Two of the rules are 'should' (weight, intrusion), but examiners enforce them through drawing objections. Checks this adds: (a) maximum stroke width in the broken-line layer is no greater than the minimum claimed-outline width; (b) broken-line segments that intersect claimed geometry are flagged, and the remedy is a companion figure; (c) a broken-line edge whose CAD source is occluded from the view direction is an error, because hidden-line removal must run before dashing; (d) a broken-line description in the specification is required whenever any broken-line layer is present. One refuted claim asserted that 1.152 itself bans full and broken alternate positions in one view (vote 0-3), so do not cite 1.152 for that.

Sources: https://www.uspto.gov/patents/basics/apply/design-patent · https://www.uspto.gov/web/offices/pac/mpep/s1503.html  (votes 3-0)

### 8. [high] Patent Center PDF font embedding and page size. Every text glyph must be embedded, subsets are allowed, and embedded fonts must be licensed and legally embeddable. Pages should be A4 or 8.5 x 11 in. Images should be scanned at 300 DPI or more. Embedding and subsetting can be checked deterministically with Poppler pdffonts (emb and sub columns) or mutool info -F. Legal embeddability can only be approximated by reading the OpenType fsType permission bits, which needs a separate font-table step.

Evidence: This merges claims 9 and 10. The page is now titled 'Patent Center PDF Guidelines' and was last updated 2024-10-02. A verifier confirmed pdffonts (Poppler 26.08.0) is installed on this workstation; mutool was not installed. Your pipeline already checks font embedding. Checks this adds: (a) read fsType from each embedded font and fail on the Restricted License bit; (b) if any raster images are embedded, check their effective resolution is at least 300 DPI.

Sources: https://www.uspto.gov/patents/apply/applying-online/efs-web-pdf-guidelines  (votes 3-0, 3-0)

### 9. [medium] Patent Center PDF version and PDF/A. The guidelines say the PDF must conform to Adobe PDF versions 1.1 through 1.6, and that a PDF/A-conformant document meets the submission requirements. Because PDF/A-2, -3 and -4 allow 1.7 or 2.0 headers, the safe gate is veraPDF with a PDF/A-1b (or 1a) profile together with a version check. That check must read both the %PDF header and the document catalog /Version entry and require the effective version to be 1.6 or lower.

Evidence: Claim 8, vote 2-1. The requirement text is verbatim and current, from October 2024. The guidance looks stale and loosely enforced: the USPTO's own Patent Center User Guide (September 2025) is itself a %PDF-1.7 file, and practitioner reports say Patent Center validates very little. The Library of Congress format page describes PDF/A-1 as constrained PDF 1.4 and says it meets USPTO requirements. Staying at version 1.6 or lower is the conservative choice; violating it is not a confirmed rejection cause. Checks this adds: a header and catalog version check, plus a veraPDF PDF/A-1b run. veraPDF itself was not verified in this run (see caveats).

Sources: https://www.uspto.gov/patents/apply/applying-online/efs-web-pdf-guidelines · https://www.loc.gov/preservation/digital/formats/fdd/fdd000125.shtml  (votes 2-1)

### 10. [high] Who reviews design drawings. OPAP's pre-examination drawing review covers only new utility and plant applications. It is a scan and reproducibility screen, not a full 1.84 audit, and it is lenient enough that most drawings pass, including drawings marked informal. MPEP 507 limits OPAP objections to grounds A–G: (A) lines too light or text illegible, (B) missing lead lines, (C) excessive or non-English text, (D) wrong margins or paper size, (E) figures not labeled 'Fig.' with consecutive numbers, (F) photographs illegible after scanning, (G) color drawings without a petition. Design applications are not published, and OPAP does not review design drawings for publication.

Evidence: This merges claims 14 and 15. MPEP 507 [R-07.2015] is still live text (page modified 2026-03-09), and MPEP 608.02 and 608.02(b) say the same independently. OPAP still checks design applications for formalities other than publication quality, such as whether all described figures are present. The Office of Data Management can require corrected drawings at allowance if the drawings cannot be scanned (MPEP 608.02(z), 1302.05). Grounds A–G are the nearest current successor to an objection-category list. Treat them as a minimum floor, not the design-set standard.

Sources: https://www.uspto.gov/web/offices/pac/mpep/s507.html · https://www.uspto.gov/web/offices/pac/mpep/s608.html  (votes 3-0, 3-0)

### 11. [medium] The draftsperson review has been eliminated; examiners are the real gate. An October 25, 2012 USPTO memo, 'Elimination of the Notice of Draftsperson's Patent Drawing Review', ended the separate draftsperson review (form PTO-948). OPAP staff now judge whether a drawing can be adequately reproduced, and they object before examination starts. Examiners remain responsible for drawing content under 1.83 and may raise any 1.84 formality in an Office action. A third point comes at allowance, where 1.85(c) can require compliant drawings within a non-extendable period. For design sets, the examiner applying 1.84, 1.152 and MPEP 1503.02 is the primary reviewer.

Evidence: This merges claims 16 and 17, each voted 2-1. The memo text was extracted with pdftotext and matches the claims; current MPEP 608.02(a) and (b) agree with it. A related claim was refuted 0-3: that drawing formalities are checked only by OPAP and that a pipeline should model OPAP. That claim is wrong because examiners also object, and because OPAP's publication screen does not apply to design sets. Pipeline implication: PTO-948 categories are historical. Calibrate checks to examiner objections under 1.84 and 1.152 and to MPEP 1503.02 form paragraphs, including the 112(a)/(b) risks from shading and inconsistent views.

Sources: https://www.uspto.gov/sites/default/files/patents/law/exam/aia_changes_20121025.pdf · https://www.uspto.gov/web/offices/pac/mpep/s608.html · https://www.uspto.gov/web/offices/pac/mpep/s507.html  (votes 2-1, 2-1)

## Caveats
Coverage gaps. Only claims about US normative text and Patent Center PDF rules survived verification. Nothing was verified on: commercial or open-source patent-drawing QA tools; veraPDF, qpdf, Ghostscript, pdfcpu, ImageMagick, OpenCV or potrace capabilities and licenses (only pdffonts was confirmed installed); SVG linters or CAD exporters; research papers or datasets; the 1993/2002 Guide for the Preparation of Patent Drawings or any newer edition; Hague DM/1 or WIPO Administrative Instructions; EUIPO or UKIPO representation guidance; AIPLA or IPO material; professional illustrator checklists. The tool recommendations in the findings (veraPDF PDF/A-1b, pdffonts, mutool, fsType reading) are verifier inferences, not verified claims about those tools. Refuted claims to avoid relying on: the Hague 16 x 16 cm and 3 cm reproduction limits (0-3); several 37 CFR 1.152 detail claims (structure and version history, 'adequate shading is purely qualitative', a 1.152 ban on alternate positions); the claim that design-drawing paper, size and margins are the only hard threshold under 1.85(a); and the claim that the Design Guide itself warns of 112 nonenablement and new matter. The 112(a)/(b) nonenablement point is supported only through MPEP 1503.02 as quoted in verifier evidence. The new-matter point is unverified. Modal strength matters for severity: cross-hairs, the 45° light direction, short lead lines, broken-line weight and intrusion, and the no-mixing shading rule are all 'should' or advisory and belong in warnings, not errors. The 2/3-reduction line-weight test and every density or light-side heuristic are pipeline design choices, not USPTO thresholds. The PDF 1.1–1.6 ceiling appears stale and weakly enforced. Source access: the eCFR HTML page redirected to a bot block, so the text was confirmed through the eCFR API and Cornell LII. Time sensitivity: eCFR as of 2026-10-01; MPEP sections R-01.2024, R-10.2019 and R-07.2015 (pages modified 2026-03-09); Patent Center guidelines updated 2024-10-02; the 2012 memo is old but consistent with the current MPEP.

## Open questions
- Does Patent Center actually reject or alter PDFs above version 1.6, non-PDF/A files, or vector-only drawings? Does it rasterize sheets at intake (which would change effective line weight and stipple density)? An empirical test-upload study, or the current Patent Center User Guide, would settle what the pipeline must emit.
- How do design examiners judge 'adequate surface shading' and 'inconsistent views' in practice? Which MPEP 1503.02 form paragraphs and objection rates are most common? Is there any numeric shading-density or line-weight convention used by professional illustrators that could set the pipeline's heuristic thresholds?
- What are the exact current Hague (DM/1, Administrative Instructions Part Four), EUIPO and UKIPO representation requirements (view limits, background, size, disclaimers, broken-line and shading conventions), and where do they conflict with US 1.84 and 1.152? The 16 x 16 cm claim was refuted, so this remains open.
- Does any programmatic patent-drawing QA tool (commercial or open source) or any academic dataset or paper on automated figure-compliance checking exist? If so, what does it check beyond the rules listed here, and under what license?

## Refuted claims

Seven claims were refuted and are listed in the session scratchpad; the ones a reader is most likely to meet: the Hague 16 x 16 cm limit (0-3), a 1.152 ban on alternate positions (0-3), 'paper/size/margins are the only hard threshold' (0-3), and 'OPAP is the only gate' (0-3).

## Unverified claims (0)


## Sources fetched
- [primary] https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFRc7605aa2d3f3782/section-1.84 (Normative primary text (CFR + MPEP), 5 claims)
- [primary] https://www.ecfr.gov/current/title-37/chapter-I/subchapter-A/part-1/subpart-B/subject-group-ECFR5ba9219fb1b6d20/section-1.152 (Normative primary text (CFR + MPEP), 5 claims)
- [primary] https://www.uspto.gov/web/offices/pac/mpep/s608.html (Normative primary text (CFR + MPEP), 5 claims)
- [primary] https://www.uspto.gov/sites/default/files/documents/suppguidance-cginterfacesicons-part1-mar2026.pdf (Normative primary text (CFR + MPEP), 5 claims)
- [primary] https://www.uspto.gov/patents/apply/applying-online/efs-web-pdf-guidelines (USPTO drawing-review practice and filing specs, 5 claims)
- [primary] https://www.uspto.gov/patents/basics/apply/design-patent (USPTO drawing-review practice and filing specs, 5 claims)
- [primary] https://www.uspto.gov/web/offices/pac/mpep/s507.html (USPTO drawing-review practice and filing specs, 5 claims)
- [primary] https://www.uspto.gov/sites/default/files/patents/law/exam/aia_changes_20121025.pdf (USPTO drawing-review practice and filing specs, 5 claims)
- [primary] https://www.wipo.int/export/sites/www/hague/en/docs/hague_system_administrative_instructions.pdf (International design representation rules (Hague/EUIPO/UKIPO), 5 claims)
- [primary] https://wipo.int/export/sites/www/hague/en/docs/reproductions_technical_requirements.pdf (International design representation rules (Hague/EUIPO/UKIPO), 5 claims)
- [primary] https://euipo.europa.eu/tunnel-web/secure/webdav/guest/document_library/contentPdfs/law_and_practice/decisions_president/EX-26-3_en.pdf (International design representation rules (Hague/EUIPO/UKIPO), 5 claims)
- [primary] https://euipo.europa.eu/tunnel-web/secure/webdav/guest/document_library/EUIPN/contentPdfs/Common_Practices/Annex_CC_Design_representation.pdf (International design representation rules (Hague/EUIPO/UKIPO), 5 claims)
- [primary] https://hub.docker.com/r/verapdf/cli (Programmatic checkers: PDF preflight, image analysis, patent QA software, research, 5 claims)
- [primary] https://pdfcpu.io/core/validate (Programmatic checkers: PDF preflight, image analysis, patent QA software, research, 5 claims)
- [primary] https://www.uspto.gov/sites/default/files/documents/tc2900_drawing_objections_fy23.pdf (Practitioner checklists and design-drawing rejections, 5 claims)
- [primary] https://www.uspto.gov/web/offices/pac/mpep/s1504.html (Practitioner checklists and design-drawing rejections, 5 claims)
- [primary] https://www.uspto.gov/web/offices/pac/mpep/s1503.html (Practitioner checklists and design-drawing rejections, 5 claims)
- [primary] https://www.uspto.gov/sites/default/files/documents/tc2900_fedcir_decisions.pdf (Practitioner checklists and design-drawing rejections, 5 claims)
- [blog] https://ipwatchdog.com/2019/11/21/most-common-design-patent-application-rejections-how-to-avoid-them-part-ii/ (Practitioner checklists and design-drawing rejections, 5 claims)
- [blog] https://www.poszlaw.com/wp-content/uploads/2020/07/2020.04.22-Posz-Law-Patent-Focus-Design-Patent-Drawing-Tips.pdf (Practitioner checklists and design-drawing rejections, 5 claims)

