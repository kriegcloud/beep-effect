$ bun run src/cli.ts --provider google --model "gemini-3-pro-preview" --sub-model "gemini-3-flash-preview" --nlp-tools --no-color --max-llm-calls "500" --context-file test/fixtures/breakthrough-articles-cleaned.ndjson "Your task: Extract ALL predictions — both POSITIVE and NEGATIVE — about energy systems and technologies from this corpus of Breakthrough Institute articles.

## DEFINITIONS

- **POSITIVE prediction**: A claim that something WILL happen, is expected, projected, or targeted.
  Examples: 'nuclear capacity will reach 470 GWe by 2050', 'solar costs will decline 85%'
- **NEGATIVE prediction**: A claim that something will NOT happen, is unlikely, insufficient, or will fail.
  Examples: 'renewables alone cannot meet baseload demand', 'CCS is unlikely to be cost-competitive before 2040', 'wind will not achieve grid parity without subsidies', 'Germany will fail to meet its 2020 emissions targets'

Both types are equally important. Breakthrough Institute frequently argues AGAINST certain energy pathways — capture those skeptical/contrarian predictions.

## REQUIRED FIELDS (strict — use exactly these)

For each prediction, extract:
- **prediction_text**: The actual claim, quoted or closely paraphrased
- **polarity**: exactly 'POSITIVE' or 'NEGATIVE'
- **energy_type**: lowercase, normalized (one of: nuclear, solar, wind, natural_gas, coal, hydro, geothermal, biomass, renewables, fossil_fuels, electricity, ccs, hydrogen, general_energy)
- **timeframe**: When the prediction targets (e.g. '2030', '2050', 'by 2025', 'next decade', 'unspecified')
- **article_title**: Source article title
- **article_date**: Publication date from the record's 'date' field (YYYY-MM-DD or as available)
- **article_url**: URL from the record
- **category**: exactly one of: cost, capacity, deployment, policy, emissions, market, technology, investment, timeline
- **attribution**: exactly 'author' or 'cited' (is this Breakthrough's own claim or citing IEA/IPCC/study?)

## SYSTEMATIC APPROACH

1. Parse records, inspect the data shape. Note the 'date' field for each article.
2. Build a corpus: CreateCorpus + LearnCorpus in batches of 500.
3. Run QueryCorpus with BOTH positive AND negative prediction queries:
   - Positive: 'forecast growth projections by 2030 2050', 'will increase expand deploy', 'target goal expected projected'
   - Negative: 'will not cannot unlikely insufficient fail', 'barrier obstacle challenge impossible', 'overestimate unrealistic optimistic assumption flawed'
4. Score ALL 1637 articles by prediction density using code (regex for future years, modal verbs, quantities, AND negative markers like not/unlikely/fail/cannot/insufficient).
5. Process top ~200 articles with llm_query, extracting structured JSON per article. Parse responses with code — if JSON parsing fails, skip and continue.
6. Normalize: lowercase energy_type, enforce category enum, deduplicate.
7. Store __vars.predictions (array of objects) and __vars.final_report (markdown with stats + full listing sorted by energy_type then article_date).

## REPORT FORMAT

The final report should have:
1. Executive summary with counts by polarity, energy_type, category
2. Separate sections: POSITIVE predictions then NEGATIVE predictions
3. Within each section, group by energy_type
4. Each prediction shows: prediction_text | polarity | timeframe | article_date | category | attribution | source title + URL

SUBMIT({ variable: 'final_report' }) when done."
[sandbox-worker] Init: callId=root depth=0 mode=permissive maxFrameBytes=33554432 tools=BowCosineSimilarity,ChunkBySentences,CorpusStats,CreateCorpus,DeleteCorpus,DocumentStats,ExtractEntities,ExtractKeywords,LearnCorpus,LearnCustomEntities,NGrams,PhoneticMatch,QueryCorpus,RankByRelevance,Sentences,TextSimilarity,TverskySimilarity,Tokenize,TransformText
╭─ Call [depth=0] ────────────────────────────────────────────────────────────────────────────────────────────────────╮
[0:1] ── Iteration ────────────────────────────────────────────────────────────────────────────────────────── (49i 500c)
⚠ TOOLKIT_DEGRADED: Tool-enabled generation failed; retrying this iteration without tool calling (Model error: MalformedOutput: { "module": "LanguageModel", "method": "generateText", "description": undefined, "cause": ReadonlyArray<TextPart | ReasoningPart | FilePart | DocumentSourcePart | UrlSourcePart | ResponseMetadataPart | FinishPart | ToolCallPart | ToolResultPart(SUBMIT)>
└─ [1]
   └─ TextPart | ReasoningPart | FilePart | DocumentSourcePart | UrlSourcePart | ResponseMetadataPart | FinishPart | ToolCallPart | ToolResultPart(SUBMIT)
      ├─ UrlSourcePart
      │  └─ ["sourceType"]
      │     └─ is missing
      └─ ToolCallPart
         └─ Encoded side transformation failure
            └─ (Struct (Encoded side) <-> Struct (Type side))
               └─ Encoded side transformation failure
                  └─ Struct (Encoded side)
                     └─ ["name"]
                        └─ Expected "SUBMIT", actual "run_code" }) [call=root, cmd=GenerateStep]
```js
// Step 1: Inspect data and initial processing
const lines = __vars.context.trim().split('\n');
print(`Total records: ${lines.length}`);

// Parse a few to see structure
const sample = lines.sli...  [in:11054 out:641 reason:573 = 12268]
▶ Code:
│ // Step 1: Inspect data and initial processing
│ const lines = __vars.context.trim().split('\n');
│ print(`Total records: ${lines.length}`);
│ 
│ // Parse a few to see structure
│ const sample = lines.slice(0, 3).map(line => JSON.parse(line));
│ print(JSON.stringify(sample[0], null, 2));
│ 
│ // Define scoring logic for prediction density
│ // We look for sentences with future years AND prediction verbs/modals
│ const FUTURE_YEARS = /\b(202[4-9]|20[3-9][0-9]|2100)\b/; // 2024-2099, 2100
│ const PREDICTION_TERMS = /\b(will|expect|project|forecast|target|aim|goal|estimate|predict|unlikely|fail|cannot|insufficient)\b/i;
│ ... (40 more lines)
◀ Output:
│ Total records: 1637
│ {
│   "url": "https://thebreakthrough.org/articles/2013-a-year-of-hope-and-change-for-the-environment",
│   "title": "2013: A Year of Hope and Change for the Environment",
│   "subtitle": "How the Green Ideological Nucleus Split",
│   "authors": [
│     "Breakthrough Staff"
│   ],
│   "date": "2013-12-31T10:57:00-08:00",
│   "section": "Articles",
│   "categories": [],
│   "topics": [
│     "China",
│     "New York Times",
│     "Barack Obama",
│     "U.S. Department of Energy",
│     "India",
│     "German...
[0:2] ── Iteration ────────────────────────────────────────────────────────────────────────────────────────── (48i 498c)
```js
// Select top 200 candidates
// We already sorted scoredArticles in the previous step
__vars.candidates = scoredArticles.slice(0, 200).map(a => a.doc);
print(`Updated candidates to top ${__vars....  [in:14132 out:382 reason:974 cache:8169 = 15488]
▶ Code:
│ // Select top 200 candidates
│ // We already sorted scoredArticles in the previous step
│ __vars.candidates = scoredArticles.slice(0, 200).map(a => a.doc);
│ print(`Updated candidates to top ${__vars.candidates.length}`);
│ 
│ // Check word counts to ensure we don't blow context limits too hard
│ const lengths = __vars.candidates.map(c => (c.body_markdown || "").length);
│ const avgLen = lengths.reduce((a,b)=>a+b,0) / lengths.length;
│ const maxLen = Math.max(...lengths);
│ print(`Avg char length: ${Math.round(avgLen)}, Max char length: ${maxLen}`);
│ 
│ // Helper to sanitize text for LLM
│ ... (20 more lines)
◀ Error: scoredArticles is not defined
[0:3] ── Iteration ────────────────────────────────────────────────────────────────────────────────────────── (47i 497c)
```js
// Recover from lost local variable by using the persisted one
// We have 100 candidates in __vars.candidates from step 1
print(`Using ${__vars.candidates.length} candidates.`);

// Prepare batc...  [in:14528 out:239 reason:724 cache:8165 = 15491]
▶ Code:
│ // Recover from lost local variable by using the persisted one
│ // We have 100 candidates in __vars.candidates from step 1
│ print(`Using ${__vars.candidates.length} candidates.`);
│ 
│ // Prepare batch 1
│ const BATCH_SIZE = 5;
│ const batchDocs = __vars.candidates.slice(0, BATCH_SIZE);
│ 
│ // Helper to format text for the LLM
│ const formatForLLM = (doc) => {
│   let text = `Title: ${doc.title}\nDate: ${doc.date}\n\n${doc.body_markdown || ""}`;
│   return text.slice(0, 25000); // Token limit safety
│ ... (11 more lines)
◀ Output:
│ Using 100 candidates.
│ Ready to process first batch of 5 articles.
[0:4] ── Iteration ────────────────────────────────────────────────────────────────────────────────────────── (46i 496c)
⚠ TOOLKIT_DEGRADED: Tool-enabled generation failed; retrying this iteration without tool calling (Model error: MalformedOutput: { "module": "LanguageModel", "method": "generateText", "description": undefined, "cause": ReadonlyArray<TextPart | ReasoningPart | FilePart | DocumentSourcePart | UrlSourcePart | ResponseMetadataPart | FinishPart | ToolCallPart | ToolResultPart(SUBMIT)>
└─ [1]
   └─ TextPart | ReasoningPart | FilePart | DocumentSourcePart | UrlSourcePart | ResponseMetadataPart | FinishPart | ToolCallPart | ToolResultPart(SUBMIT)
      ├─ UrlSourcePart
      │  └─ ["sourceType"]
      │     └─ is missing
      └─ ToolCallPart
         └─ Encoded side transformation failure
            └─ (Struct (Encoded side) <-> Struct (Type side))
               └─ Encoded side transformation failure
                  └─ Struct (Encoded side)
                     └─ ["name"]
                        └─ Expected "SUBMIT", actual "llm_query_batched" }) [call=root, cmd=GenerateStep]
I will now run the extraction on the first batch of 5 articles to verify the extraction logic and prompt structure.

```js
// Initialize or load state
if (typeof __vars.processedIndex === 'undefined')...  [in:14658 out:287 reason:382 cache:8163 = 15327]
▶ Code:
│ // Initialize or load state
│ if (typeof __vars.processedIndex === 'undefined') __vars.processedIndex = 0;
│ if (typeof __vars.allPredictions === 'undefined') __vars.allPredictions = [];
│ 
│ const BATCH_SIZE = 5;
│ const currentIndex = __vars.processedIndex;
│ const candidates = __vars.candidates;
│ 
│ if (currentIndex >= candidates.length) {
│   print("All candidates processed.");
│ } else {
│   const batch = candidates.slice(currentIndex, currentIndex + BATCH_SIZE);
│ ... (11 more lines)
◀ Processing batch 0 to 5 (of 100)
[0:5] ── Iteration ────────────────────────────────────────────────────────────────────────────────────────── (45i 494c)
  [in:15390 out:37 reason:290 cache:8314 = 15717]
✗ FAILED: OutputValidationError
: Plain-text output requires `SUBMIT({ answer: "..." })` OR `SUBMIT({ variable: "name" })` with no extra fields. { readonly answer: string }
└─ ["value"]
   └─ is unexpected, expected: "answer", raw=
✗ FAILED: OutputValidationError
: Plain-text output requires `SUBMIT({ answer: "..." })` OR `SUBMIT({ variable: "name" })` with no extra fields. { readonly answer: string }
└─ ["value"]
   └─ is unexpected, expected: "answer", raw=

error: script "rlm" exited with code 1
