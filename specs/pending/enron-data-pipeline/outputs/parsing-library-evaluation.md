# Parsing Library Evaluation: RFC 2822 / MIME (Node.js)

Last verified: 2026-02-15

## Requirements

Must support:
- Header extraction: `From`, `To`, `CC`, `BCC`, `Date`, `Subject`, `Message-ID`, `In-Reply-To`, `References`
- Multipart MIME parsing
- Quoted-printable / base64 handling
- Signature stripping support path
- TypeScript-friendly integration
- Reasonable dependency risk

## Comparison Matrix

| Library | Header Extraction Coverage | MIME + Encodings | Signature Handling | TypeScript | Dependencies | Maintenance Signal | Notes |
|---|---|---|---|---|---|---|---|
| `mailparser` | Full support via parsed mail object (`from`, `to`, `cc`, `bcc`, `date`, `subject`, `messageId`, `inReplyTo`, `references`) | Strong multipart support; designed for large RFC 822 streams; charset decoding support | No built-in signature stripping | No built-in types; uses `@types/mailparser` | 10 runtime deps | Latest `3.9.3` (2026-01-28), but README marks project in maintenance mode | Strong and proven, but heavier and intentionally not adding new features |
| `postal-mime` | Full support in parsed `Email` object (`from`, `to`, `cc`, `bcc`, `messageId`, `inReplyTo`, `references`, headers array) | Explicit support for complex/nested MIME and attachment encoding options including base64; RFC compliant | No built-in signature stripping | Built-in `.d.ts` and exported types | 0 runtime deps | Latest `2.7.3` (2026-01-09) | Best balance for this phase: modern API, low dependency surface, strong typing |
| `emailjs-mime-parser` | Low-level parser; required headers are available through MIME node headers but need manual extraction/mapping | MIME tree parser; base64 / quoted-printable decode behavior documented; line terminators preserved | No built-in signature stripping | No built-in types; no `@types` package | 3 runtime deps | Latest `2.0.7` (2019-03-25); README says not actively maintained | Viable only if we want low-level control and accept more custom code |

## Additional Findings

- Popularity (last-week npm downloads):
  - `mailparser`: 2,594,460
  - `postal-mime`: 294,707
  - `emailjs-mime-parser`: 11,451
- None of the three libraries provides first-class signature stripping. Signature removal should be implemented as a separate normalization step in `EnronParser` (heuristics or an additional reply/signature parser).

## Recommendation

Primary recommendation: **`postal-mime`**

Why:
1. Meets all required header extraction and MIME/encoding needs for Enron parsing.
2. Lowest dependency risk (`0` runtime dependencies).
3. Built-in TypeScript types reduce integration friction in `tooling/cli`.
4. Active maintenance without the "maintenance mode" constraint called out by `mailparser`.

Fallback: **`mailparser`**

Use if streaming very large messages/attachments becomes critical in later phases. Keep in mind:
- Extra dependency surface.
- Maintenance-mode status.
- Type definitions come from DefinitelyTyped.

Do not recommend as primary: **`emailjs-mime-parser`**
- Low-level API increases implementation burden.
- Stale maintenance profile.
- Weak TypeScript ergonomics.

## Implementation Implications for Phase 1

- Build `EnronParser` around `postal-mime.parse(...)`.
- Normalize extracted header values into `EnronEmail` schema fields.
- Add explicit post-parse step for signature/reply text cleanup.
- Keep parser abstraction narrow so fallback to `mailparser` remains possible if streaming needs change.

## Sources

- https://www.npmjs.com/package/mailparser
- https://raw.githubusercontent.com/nodemailer/mailparser/master/README.md
- https://nodemailer.com/extras/mailparser
- https://registry.npmjs.org/mailparser
- https://unpkg.com/@types/mailparser/index.d.ts
- https://www.npmjs.com/package/postal-mime
- https://raw.githubusercontent.com/postalsys/postal-mime/master/README.md
- https://registry.npmjs.org/postal-mime
- https://www.npmjs.com/package/emailjs-mime-parser
- https://raw.githubusercontent.com/emailjs/emailjs-mime-parser/master/README.md
- https://registry.npmjs.org/emailjs-mime-parser
- https://api.npmjs.org/downloads/point/last-week/mailparser
- https://api.npmjs.org/downloads/point/last-week/postal-mime
- https://api.npmjs.org/downloads/point/last-week/emailjs-mime-parser
