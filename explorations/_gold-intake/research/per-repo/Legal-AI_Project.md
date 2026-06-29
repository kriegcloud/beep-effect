# Legal-AI_Project  `[T3]`

- **Purpose:** Full-stack contract Q&A demo: Next.js/NextAuth UI + Flask server running a CUAD-fine-tuned RoBERTa extractive QA model over uploaded contracts, with T5 paraphrase and TextBlob sentiment.
- **Stack:** Python (Flask, Gunicorn, HuggingFace transformers, PyTorch, textblob, PyPDF4) backend; TypeScript/Next.js + NextAuth (Google OAuth) frontend; Docker Compose.
- **Size / shape:** ~88 files, small full-stack demo app (Flask API server ~4 Python files + Next.js client). Web app + ML inference server.
- **License:** ISC
- **Maturity:** Last commit 2026-03-15; client LICENSE is ISC inherited from the next-auth example fork (Iain Collins, 2018-2021).

**Notes:** Tiny demo. Frontend is a fork of the next-auth example (hence the ISC/Iain Collins LICENSE) and adds little reusable to beep. Backend is mostly boilerplate HuggingFace inference, but the bundled CUAD 41-clause question set and the span-grounded extractive QA pattern are genuinely relevant to beep's contract/clause extraction and provenance-span goals. beep already has langextract/span-grounded extraction, so the QA code is adjacent, not novel.

## Gold nuggets (2)

### 1. CUAD 41-category contract clause taxonomy (question prompts)
`ip-domain-models` · relevance: **direct** · verified

The full Contract Understanding Atticus Dataset (CUAD) clause taxonomy expressed as 41 labeled extraction prompts (Document Name, Parties, Governing Law, Non-Compete, IP Ownership Assignment, Joint IP Ownership, License Grant, Non-Transferable License, Irrevocable/Perpetual License, Source Code Escrow, Cap On Liability, etc.), each with a category name plus a plain-language 'Details' definition. This is a ready-made, expert-curated controlled vocabulary for contract/IP clause classification and for driving span-grounded clause extraction. Directly seeds beep's law-practice clause models and IP-licensing domain models (License Grant, IP Ownership, Joint IP Ownership map straight to IPRonto/Copyright-Ontology concepts).

- **Source:** `server/data/questions.txt:1-41`
- **beep-target:** @beep/law-practice clause/contract schema + IPRonto/Copyright-Ontology license-grant taxonomy; classification label set for @beep/nlp-mcp clause extraction

```
Question 24: ... "Ip Ownership Assignment" ... Does intellectual property created by one party become the property of the counterparty...
Question 26: ... "License Grant" ... Does the contract contain a license granted by one party to its counterparty?
Question 31: ... "Irrevocable Or Perpetual License" ... Does the contract contain a license grant that is irrevocable or perpetual?
```

### 2. Span-grounded extractive QA with n-best probabilities and character offsets
`provenance-evidence` · relevance: **adjacent** · adjusted

run_prediction wraps a SQuAD-v2-style extractive QA model (CUAD RoBERTa) to return n-best answers, written to nbest.json via compute_predictions_logits, building SquadExample objects (with start_position_character field) over the source contract context_text and using version_2_with_negative=True for null/'no answer found' handling. This is beep's RETRIEVAL-side pattern: fallible candidate answers grounded into the source text with n-best ranking and null-score thresholding, suitable for a candidate->approved gate. Adjacent since beep already has @beep/langextract span extraction, but the n-best + null_score_diff_threshold null handling is a clean reference for candidate scoring. Note: in this prediction path start_position_character is passed as None (it is the training-side field), so 'character offset with probability score' is realized via the n-best/logit output rather than the example's start_position_character.

- **Source:** `server/predict.py:108-127`
- **beep-target:** @beep/epistemic CandidateClaim/GroundedExtraction.span + probability scoring; @beep/langextract span-grounded extraction reference

```
output_nbest_file = None
if n_best_size > 1:
    output_nbest_file = "nbest.json"
final_predictions = compute_predictions_logits(
    all_examples=examples, all_features=features, all_results=all_results,
    n_best_size=n_best_size, max_answer_length=max_answer_length,
    version_2_with_negative=True,
    null_score_diff_threshold=null_score_diff_threshold, tokenizer=tokenizer)
```
