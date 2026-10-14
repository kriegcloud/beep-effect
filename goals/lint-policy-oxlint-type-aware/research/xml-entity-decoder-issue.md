# Upstream issue: fast-xml-parser 5.11.2 entityDecoder declaration/runtime mismatch

Status: historical hypothesis disproved; no upstream issue was filed or is required.
The final non-deprecated replacement passes nine differential parser cases and
16 caption integration cases. It creates a fresh parser/decoder per parse to
match legacy XML-version isolation. See xml-parser-parity.mjs.txt.


Upstream: https://github.com/NaturalIntelligence/fast-xml-parser
Installed src/fxp.d.ts:415 declares entityDecoder as EntityDecoderOptions;
src/xmlparser/OrderedObjParser.js:92-93 assigns it directly, then line 293 calls reset().
An options object throws `this.entityDecoder.reset is not a function`.
No published issue number is asserted; the envelope prohibits external publication.
This receipt is the issue draft for the orchestrator, with the exact mismatch named
in the source suppression. htmlEntities preserves the existing named/numeric decoding
and expansion limits. Migration is class (c), pending a compatible upstream boundary.

Reproducer: `new XMLParser({entityDecoder:{namedEntities:{nbsp:" "},numericAllowed:true}}).parse("<text>A&nbsp;B</text>")`.

## Correction after installed declaration inspection

The earlier mismatch claim was incorrect. fxp.d.ts:214-220 describes the
decoder instance methods; the constructor options belong to @nodable/entities.
Passing a real EntityDecoder is type-compatible and passes seven differential
legacy/replacement cases. No upstream bug is asserted and no issue needs filing.
The source now uses the replacement with identical maps, numeric handling,
expansion limits and unsafe-input filtering. Caption integration regressions
cover its actual runtime behavior. The historical report is retained above
for provenance, superseded by this correction.
