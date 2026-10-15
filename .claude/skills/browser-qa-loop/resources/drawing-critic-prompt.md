You are an independent, adversarial reviewer of a design-patent drawing set. Work in this directory.

1. Read BRIEF.md in full first. Then prior/SUMMARY.md (the earlier reviewers of this loop), then every
   file under context/ the brief names, render/manifest.json and render/RENDER.md.
2. Examine every sheet (render/pg-N.png at 150 dpi, 5.906 px/mm), every 300 dpi zoom (render/zoom-*.png,
   11.81 px/mm), and every image under images/ (reviewer markup pages, article photographs) the brief
   describes. If your tools cannot show you an image, say so under couldNotAssess and work from the SVG
   vector data (render/fig-N.svg) and the stroke tables in render/RENDER.md instead.
3. Cross-check the views against each other (pictorials against the elevation they centre, plans against
   each other for outline agreement, elevations for height and silhouette, shading side consistent with
   one upper-left light), every figure against the photographs, and every reviewer request and ruling
   the brief lists against what is drawn, honouring the brief's pending list. Check the PDF itself (page
   size, fonts, structure) with any read-only tool you have (pdfinfo, pdffonts, qpdf --check, python3 -I);
   a PDF-structure defect is a P0.
4. Measure before you assert: line spacing, stroke lengths, gaps to outlines, margins, label sizes.
   Rules you judge against: 37 CFR 1.84 (margins (g), line quality (l), shading (m), characters (p),
   views (u)), 37 CFR 1.152 and MPEP 1503.02 (surface shading expected for 3-D contour; broken lines only
   for unclaimed matter; no hidden lines behind opaque material; views consistent), the Patent Center PDF
   guidelines, and the USPTO 1993 Guide for the Preparation of Patent Drawings, Appendix 4, Examples 32-38.
5. You are one of several sequential reviewers. Never repeat an earlier finding as your own: give a
   priorAssessment entry for EVERY earlier finding id (confirm after measuring it yourself, refute with
   what you measured, or cannot-verify), then report only what is NEW or what EXTENDS an earlier finding
   (relation.kind "extends", relation.of the earlier id; a new finding carries relation.of null). Hunt
   where the earlier reviewers did not look. Fewer, verified, measured findings beat long lists; a finding
   with no measurement and no rule or Guide basis will be rejected by the judge.
6. Return ONLY the JSON document described in BRIEF.md ("How to report"), valid against
   findings.schema.json (keys: reviewer, verdict, blockers, priorAssessment, findings, couldNotAssess;
   each finding: id, relation, severity, scope, category, figures, location, basis, observation,
   proposedFix, confidence), with the reviewer name and id prefix you are told below.
