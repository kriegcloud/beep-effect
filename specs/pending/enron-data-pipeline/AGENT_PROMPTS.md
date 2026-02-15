# Agent Prompts: Enron Data Pipeline

> Reusable prompt templates for sub-agents delegated during spec execution.

---

## web-researcher: Dataset Evaluation (P0.1)

```
Research the Enron email corpus for use as test data in a knowledge extraction pipeline.

### Research Questions

1. Is the CMU Enron corpus still available at https://www.cs.cmu.edu/~enron/ ?
2. What is the Kaggle CSV format? (columns: `file` and `message`, encoding, total size ~1.4GB)
3. Are there pre-parsed JSON versions on HuggingFace or other sources?
4. What are the licensing/usage terms for each version?
5. What is the exact message count and file structure of the CMU maildir version?

### Evaluation Criteria

- Ease of parsing (single file vs directory tree)
- Header preservation (RFC 2822 Message-ID, In-Reply-To, References)
- Size and download mechanics
- License compatibility with internal tooling use

### Output

Write a structured evaluation to: specs/pending/enron-data-pipeline/outputs/dataset-evaluation.md

Include a comparison table and explicit recommendation.
```

---

## web-researcher: Parsing Library Evaluation (P0.3)

```
Evaluate Node.js RFC 2822 / MIME email parsing libraries for extracting structured data from the Enron email corpus.

### Libraries to Evaluate

| Library | npm | Key Features |
|---------|-----|-------------|
| mailparser | nodemailer/mailparser | Most popular, full MIME, attachment support |
| postal-mime | nicowilliams/postal-mime | Lightweight, browser-compatible, modern API |
| emailjs-mime-parser | nicowilliams/emailjs-mime-parser | Low-level MIME parsing |
| Custom regex | N/A | Simple header/body split |

### Required Capabilities

- Extract: From, To, CC, BCC, Date, Subject, Message-ID, In-Reply-To, References
- Handle multipart MIME (even text-only emails may have multipart structure)
- Handle quoted-printable and base64 encoding
- Signature detection/stripping (nice to have)

### Evaluation Criteria

- TypeScript type definitions (native or @types/)
- Bundle size and dependency count
- API ergonomics with Effect wrapping
- Maintenance status (last publish, open issues)
- Edge case handling (malformed headers, missing fields)

### Output

Write a structured evaluation to: specs/pending/enron-data-pipeline/outputs/parsing-library-evaluation.md

Include a comparison matrix and explicit recommendation with rationale.
```

---

## effect-code-writer: Email Schema Definitions (P1.1)

```
Create Effect Schema definitions for Enron email parsing in tooling/cli/src/commands/enron/schemas.ts.

### Context

We are building a CLI command to load the Enron email corpus for knowledge extraction pipeline testing.
The schemas bridge raw RFC 2822 email data to TodoX document models.

### Schemas to Create

1. **EnronEmail** - Single parsed email:
   - from: S.String (email address)
   - to: S.Array(S.String) (email addresses)
   - cc: S.Array(S.String)
   - bcc: S.Array(S.String)
   - date: S.DateFromString
   - subject: S.String
   - messageId: S.String (RFC 2822 Message-ID)
   - inReplyTo: S.optional(S.String)
   - references: S.Array(S.String)
   - body: S.String (plain text, signatures stripped)
   - folder: S.String (original maildir folder path)
   - user: S.String (original maildir username)

2. **EnronThread** - Reconstructed email thread:
   - threadId: S.String (stable, deterministic)
   - messages: S.Array(EnronEmail)
   - participants: S.Array(S.String)
   - depth: S.Number
   - dateRange: S.Struct({ start: S.DateFromString, end: S.DateFromString })

3. **EnronDocument** - Bridge to TodoX document model:
   - id: S.String (deterministic hash of Message-ID)
   - title: S.String (email subject)
   - body: S.String (full text with span support)
   - metadata: S.Struct({ sender, recipients, threadId, originalDate })

### Patterns

- Use `import * as S from "effect/Schema"` (namespace import)
- Use `S.Class` or `S.TaggedStruct` for schema definitions
- Follow @beep/schema conventions (BS helpers where applicable)
- All arrays use S.Array, not native array methods

### Reference Files

- Effect patterns: .claude/rules/effect-patterns.md
- Existing CLI schemas: tooling/cli/src/commands/ (any existing command for patterns)
- Knowledge domain schemas: packages/knowledge/domain/src/entities/
```

---

## effect-code-writer: RFC 2822 Parser (P1.2)

```
Create an EnronParser Effect service in tooling/cli/src/commands/enron/parser.ts.

### Context

Parse raw RFC 2822 email text (from Kaggle CSV or maildir files) into EnronEmail schema instances.
Uses the parsing library selected in Phase 0 (see outputs/parsing-library-evaluation.md).

### Service Interface

EnronParser service with methods:
- parseEmail(raw: string): Effect<EnronEmail, ParseError>
- parseCsv(csvPath: string): Effect<Stream<EnronEmail>, ParseError | FileError>
- parseMaildir(dirPath: string): Effect<Stream<EnronEmail>, ParseError | FileError>

### Requirements

- Extract all RFC 2822 headers listed in EnronEmail schema
- Handle multipart MIME (extract text/plain part)
- Strip email signatures (heuristic: lines starting with --, or common signature patterns)
- Handle quoted-printable and base64 encoded bodies
- Generate stable document ID from Message-ID (deterministic hash)
- Batch parsing should use Effect Stream for memory efficiency
- Wrap external library calls in Effect.tryPromise

### Error Types

- ParseError: Invalid email format, missing required headers
- FileError: File not found, read permission denied

### Patterns

- Use Effect.gen for all effectful code
- Use @effect/platform FileSystem service (not node:fs)
- Use pipe() for transformations
- Use S.decode for schema validation
- All errors must be TaggedError instances

### Reference Files

- Selected library: outputs/parsing-library-evaluation.md
- Schema definitions: tooling/cli/src/commands/enron/schemas.ts
- Effect FileSystem patterns: .claude/rules/effect-patterns.md (FileSystem section)
- CLI command patterns: tooling/cli/src/commands/sync.ts
```

---

## effect-code-writer: Thread Reconstructor (P1.3)

```
Create a ThreadReconstructor Effect service in tooling/cli/src/commands/enron/thread-reconstructor.ts.

### Context

Groups parsed EnronEmail instances into EnronThread instances using RFC 2822 threading headers.

### Service Interface

ThreadReconstructor service with methods:
- reconstruct(emails: ReadonlyArray<EnronEmail>): Effect<ReadonlyArray<EnronThread>>
- reconstructStream(emails: Stream<EnronEmail>): Effect<ReadonlyArray<EnronThread>>

### Algorithm

1. Build message index: Map<MessageId, EnronEmail>
2. Build reply graph: For each email, link via In-Reply-To and References headers
3. Find thread roots: Messages with no In-Reply-To that aren't referenced by others
4. Walk reply chains: DFS from each root to collect thread messages
5. Handle orphans: Messages with broken references go into single-message threads
6. Compute thread metadata: depth, participants, dateRange

### Requirements

- Stable thread IDs: deterministic hash of root message's Message-ID
- Handle broken threading: missing references, forwarded messages
- Handle email loops (rare but possible in Enron data)
- Use Effect data structures: MutableHashMap for index, A.* for array operations
- Pure functions where possible, Effect only for error handling

### Patterns

- Use import * as A from "effect/Array" for all array operations
- Use MutableHashMap for message index (performance on 500K messages)
- Use Match for conditional logic
- All errors must be TaggedError instances
```

---

## test-writer: Email Parsing Tests (P1.5)

```
Write tests for the Enron email parsing infrastructure using @beep/testkit.

### Test Targets

1. **EnronParser tests** (tooling/cli/test/commands/enron/parser.test.ts):
   - Parse a well-formed RFC 2822 email
   - Extract all header fields (From, To, CC, Date, Subject, Message-ID, In-Reply-To, References)
   - Handle multipart MIME messages
   - Handle quoted-printable encoding
   - Strip email signatures
   - Fail gracefully on malformed email

2. **ThreadReconstructor tests** (tooling/cli/test/commands/enron/thread-reconstructor.test.ts):
   - Simple 2-message thread (message + reply)
   - Deep thread (5+ messages)
   - Multi-branch thread (two replies to same message)
   - Orphan messages (broken In-Reply-To reference)
   - Thread with forwarded messages

3. **Document bridge tests** (tooling/cli/test/commands/enron/document-bridge.test.ts):
   - EnronEmail -> TodoX document conversion
   - Stable document ID generation (same input = same ID)
   - Metadata mapping correctness

### Test Data

Create fixtures in tooling/cli/test/commands/enron/fixtures/:
- simple-email.txt: Well-formed RFC 2822 email
- multipart-email.txt: Multipart MIME with text/plain and text/html
- thread-emails.txt: 3-message thread with proper In-Reply-To/References
- malformed-email.txt: Missing headers, broken encoding

### Patterns

- Use effect() from @beep/testkit for each test
- Use strictEqual, deepStrictEqual for assertions
- Use Effect.gen(function* () { ... }) for test bodies
- Do NOT use bun:test directly or Effect.runPromise
- Provide test layers for FileSystem if needed
```

---

## effect-code-writer: Thread Scorer (P2.1)

```
Create a ThreadScorer Effect service in tooling/cli/src/commands/enron/thread-scorer.ts.

### Context

Scores reconstructed EnronThread instances by their value for pipeline testing.
Higher-scoring threads are more useful for validating the knowledge extraction pipeline.

### Scoring Criteria

| Factor | Points | Condition |
|--------|--------|-----------|
| Multi-party | 0-3 | 1pt per participant above 2 (max 3) |
| Thread depth | 0-3 | 1pt per message above 2 (max 3) |
| Financial keywords | 0-2 | 1pt per match (deal, position, risk, compensation, account, portfolio) |
| Action items | 0-2 | 1pt per match (please, need, deadline, follow up, action) |
| Forwarded chains | 0-1 | 1pt if thread contains forwarded messages |
| Length diversity | 0-1 | 1pt if mix of terse (<50 chars) and substantial (>200 chars) messages |

### Service Interface

ThreadScorer service with:
- score(thread: EnronThread): Effect<ScoredThread>
- rankAll(threads: ReadonlyArray<EnronThread>): Effect<ReadonlyArray<ScoredThread>>

ScoredThread = EnronThread & { score: number, breakdown: ScoreBreakdown }

### Patterns

- Pure scoring function (no I/O needed)
- Use A.reduce for keyword counting
- Use Str.toLowerCase for case-insensitive matching
- Use Order.reverse(Order.number) for descending sort
```

---

## doc-writer: Extraction Results (P4.5)

```
Write an extraction results report to specs/pending/enron-data-pipeline/outputs/extraction-results.md.

### Content

Document the results of running the knowledge extraction pipeline on the curated Enron subset:

1. **Summary Statistics**
   - Messages processed, entities extracted, relations extracted
   - Processing time, LLM calls made
   - Error rate, failure modes

2. **Entity Analysis**
   - Distribution by ontology class (Person, Organization, Financial Instrument, etc.)
   - Entity resolution statistics (duplicates merged, clusters formed)
   - Quality assessment (false positives, missed entities)

3. **Relation Analysis**
   - Distribution by predicate type
   - Relation confidence distribution
   - Cross-thread relation statistics

4. **Evidence Quality**
   - Span accuracy (do spans correctly reference source text?)
   - Citation completeness (are all claims backed by evidence?)

5. **Pipeline Issues**
   - Bottlenecks identified
   - Error patterns
   - Prompt improvement suggestions

### Format

Use tables and statistics throughout. Include specific examples of good and bad extractions.
```
