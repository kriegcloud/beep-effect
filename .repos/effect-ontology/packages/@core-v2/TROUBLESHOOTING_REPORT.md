# Extraction Run Troubleshooting Report

**Generated:** 2025-11-25  
**Source:** Jaeger traces and extraction run analysis

## Executive Summary

The extraction runs are failing due to **Google Gemini API schema validation errors**. The issue is in the entity schema definition where `attributes` is incorrectly defined as a struct with `key` and `value` properties instead of a proper record/dictionary type.

## Error Analysis

### Primary Issue: Gemini Schema Validation Failure

**Error Message:**

```
GenerateContentRequest.generation_config.response_schema.properties["entities"].items.properties["attributes"].properties: should be non-empty for OBJECT type
```

**Root Cause:**
In `packages/@core-v2/src/Schema/EntityFactory.ts` line 147, the `AttributesSchema` is incorrectly defined:

```typescript
// ❌ WRONG - This is NOT valid Effect Schema syntax!
const AttributesSchema = S.Record({
  key: S.String.annotations({...}),
  value: S.Union(S.String, S.Number, S.Boolean)
})
```

**Why This Fails for Gemini but Works for Anthropic:**

1. **Schema Interpretation**: `S.Record({ key: ..., value: ... })` is actually interpreted by Effect Schema as a struct with specific properties `{ key: string, value: ... }`, NOT as a dictionary/record type. This is a common confusion - Effect Schema's `Record` has two forms:
   - `S.Record(keySchema, valueSchema)` → Creates a dictionary with dynamic keys
   - `S.Record({ key: ..., value: ... })` → Actually creates a struct (same as `S.Struct`)

2. **JSON Schema Conversion**: When converted to JSON Schema:
   - The struct version becomes: `{ type: "object", properties: { key: {...}, value: {...} } }`
   - The dictionary version becomes: `{ type: "object", additionalProperties: {...} }`

3. **Provider Differences**:
   - **Anthropic**: More lenient - accepts both struct and dictionary formats, or may normalize the schema internally. Anthropic's API is designed to be flexible with JSON Schema variations.
   - **Gemini**: Stricter validation - Gemini's `generateContent` API with `response_schema` requires that if an object type has a `properties` field, those properties must be non-empty and valid. When Gemini sees `properties: { key: {...}, value: {...} }` for what should be a dictionary, it rejects it because:
     - The schema says "this is an object with specific properties `key` and `value`"
     - But the actual data is a dictionary like `{ "http://schema.org/age": 39 }`
     - Gemini's validator sees a mismatch and rejects it
     - Additionally, Gemini may require `additionalProperties: false` when `properties` is defined, which conflicts with dictionary semantics

4. **The Correct Effect Schema Syntax**:

   ```typescript
   // ✅ CORRECT - Effect Schema standard API for dictionaries
   const AttributesSchema = S.Record({
     key: S.String,
     value: S.Union(S.String, S.Number, S.Boolean)
   })
   ```

   This is the **only valid** Effect Schema syntax for Record (as defined in `Schema.ts` line 3059-3061).

   This converts to JSON Schema as:

   ```json
   {
     "type": "object",
     "properties": {},
     "additionalProperties": {
       "anyOf": [
         { "type": "string" },
         { "type": "number" },
         { "type": "boolean" }
       ]
     }
   }
   ```

   **The Problem**: Gemini's API doesn't support `additionalProperties` (see `ai-google/src/internal/utilities.ts` line 226-227). The ai-google conversion function needs to handle this case by either:
   - Removing empty `properties` when `additionalProperties` is present
   - Converting `additionalProperties` to a format Gemini accepts
   - Using a different schema representation for dictionaries

**Why Anthropic Works:**

- Anthropic's API is more forgiving with JSON Schema validation
- It may accept malformed schemas or handle edge cases differently
- Anthropic might be doing additional schema normalization/repair before validation

**Impact:**

- All entity extraction calls to Gemini fail with 400 Bad Request
- Chunks 16, 20, 32, 34 (and likely others) failed during extraction
- Extraction run `doc-0000000020de` completed but has no outputs (failed before completion)

### Secondary Issues

1. **Intermittent Transport Errors (Anthropic)**
   - Socket connection closed unexpectedly
   - Appears to be network-related, not code issues
   - Rate limiting is working correctly (1999/2000 requests remaining)

2. **Failed Chunks**
   - Chunks are being isolated (good error handling)
   - Failed chunks return empty graphs instead of failing entire pipeline
   - However, this means partial data loss

## Recommended Fixes

### Fix 1: Update ai-google Conversion to Handle additionalProperties

**Root Cause**: The `jsonSchemaToOpenApiSchema` function in `@effect/ai-google` doesn't handle `additionalProperties`, which Gemini doesn't support.

**File**: `docs/effect-source/ai/google/src/internal/utilities.ts` (or submit PR to `@effect/ai-google`)

**Change lines 207-229** to handle `additionalProperties`:

```typescript
// Handle object type
if ("type" in schema && schema.type === "object") {
  const objectSchema = schema as JsonSchema7Object
  const result: Mutable<typeof Schema.Encoded> = {
    type: "OBJECT",
    ...extractAnnotations(objectSchema)
  }

  // Handle additionalProperties (dictionary/record type)
  // Gemini doesn't support additionalProperties, so we need to convert it
  if (
    objectSchema.additionalProperties &&
    (!objectSchema.properties ||
      Object.keys(objectSchema.properties).length === 0)
  ) {
    // This is a dictionary type - Gemini accepts objects without properties
    // Just set type to OBJECT and let it accept any properties
    // The description should guide the LLM on what keys/values to use
    return result
  }

  if (objectSchema.properties) {
    result.properties = {}
    for (const [key, value] of Object.entries(objectSchema.properties)) {
      ;(result.properties as any)[key] = jsonSchemaToOpenApiSchema(value)
    }
  }

  if (objectSchema.required && objectSchema.required.length > 0) {
    result.required = objectSchema.required
  }

  return result
}
```

**Why**: This allows dictionary types (created by `S.Record({ key, value })`) to work with Gemini by omitting the unsupported `additionalProperties` and empty `properties` fields.

### Fix 2: Verify Schema Definitions Use Correct Syntax

**Files**:

- `packages/@core-v2/src/Schema/EntityFactory.ts`
- `packages/@core-v2/src/Domain/Model/shared.ts`

Both should use the correct Effect Schema syntax:

```typescript
// ✅ CORRECT - Effect Schema standard API
const AttributesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean)
})
```

**Note**: `S.Record(keySchema, valueSchema)` is **NOT** valid Effect Schema syntax. The only valid syntax is `S.Record({ key, value })`.

### Fix 3: Add Provider-Specific Schema Validation

Consider adding schema validation tests for each provider (Anthropic, OpenAI, Gemini) to catch provider-specific schema requirements early.

## Testing Recommendations

1. **Test with Gemini:**

   ```bash
   # Set provider to google in .env
   VITE_LLM_PROVIDER=google
   VITE_LLM_GEMINI_API_KEY=your-key
   VITE_LLM_GEMINI_MODEL=gemini-2.5-flash

   # Run extraction
   bun --env-file=.env ./src/main.ts
   ```

2. **Verify in Jaeger:**
   - Check for successful `LanguageModel.generateObject` spans
   - Verify no 400 errors from Gemini API
   - Confirm entity extraction completes for all chunks

3. **Check Extraction Run Outputs:**
   - Verify `knowledge-graph.json` is created
   - Check that all chunks processed successfully
   - Confirm `metadata.json` has `completedAt` timestamp

## Additional Observations

### Positive Findings

1. **Error Isolation:** Failed chunks are properly isolated and don't crash the entire pipeline
2. **Tracing:** Excellent observability with Jaeger - all errors are captured with full context
3. **Rate Limiting:** Working correctly - no rate limit errors observed
4. **Retry Logic:** `generateObjectWithFeedback` handles retries automatically

### Areas for Improvement

1. **Schema Compatibility:** Need provider-specific schema validation
2. **Error Recovery:** Consider retrying failed chunks with exponential backoff
3. **Monitoring:** Add alerts for high chunk failure rates
4. **Documentation:** Document provider-specific schema requirements

## Next Steps

1. ✅ Apply Fix 1 (correct AttributesSchema definition)
2. ✅ Test with Gemini provider
3. ✅ Verify in Jaeger that errors are resolved
4. ✅ Re-run failed extraction runs
5. ⚠️ Consider adding provider-specific schema tests

## Trace IDs for Reference

- Latest trace: `3f1590c9d9546f679e83b70aa425e810`
- Failed chunks: 16, 20, 32, 34
- Extraction run: `doc-0000000020de`

View in Jaeger: http://localhost:16686/trace/3f1590c9d9546f679e83b70aa425e810
