import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import { NodeFileSystem, NodePath } from '@effect/platform-node';
import { Effect, Layer } from 'effect';

import { Bm25WriterLive, EmbeddingServiceLive, LanceDbWriterLive } from '/home/elpresidank/YeeBois/projects/beep-effect2/tooling/codebase-search/dist/indexer/index.ts-morph';
import { PipelineLive } from '/home/elpresidank/YeeBois/projects/beep-effect2/tooling/codebase-search/dist/indexer/Pipeline.js';
import { handleBrowseSymbols } from '/home/elpresidank/YeeBois/projects/beep-effect2/tooling/codebase-search/dist/mcp/BrowseSymbolsTool.js';
import { handleFindRelated } from '/home/elpresidank/YeeBois/projects/beep-effect2/tooling/codebase-search/dist/mcp/FindRelatedTool.js';
import { handleReindex } from '/home/elpresidank/YeeBois/projects/beep-effect2/tooling/codebase-search/dist/mcp/ReindexTool.js';
import { handleSearchCodebase } from '/home/elpresidank/YeeBois/projects/beep-effect2/tooling/codebase-search/dist/mcp/SearchCodebaseTool.js';
import { HybridSearchLive, RelationResolverLive } from '/home/elpresidank/YeeBois/projects/beep-effect2/tooling/codebase-search/dist/search/index.ts-morph';
import * as Str from "effect/String";


const rootDir = '/home/elpresidank/YeeBois/projects/beep-effect2';
const indexPath = join(rootDir, '.code-index');
const outputPath = '/tmp/p6-results.json';

const qualityQueries = [
  { query: 'create Account schema', expected: ['PackageName', 'PackageJsonSchema', 'schema', 'Schema.'] },
  { query: 'add error handling', expected: ['IndexingError', 'SearchTimeoutError', 'SymbolNotFoundError', 'error'] },
  { query: 'reindex codebase', expected: ['handleReindex', 'ReindexTool', 'Pipeline.run', 'reindex'] },
  { query: 'session start hook overview', expected: ['sessionStartHook', 'generateSessionOverview', 'SessionStart'] },
  { query: 'auto context prompt submit hook', expected: ['promptSubmitHook', 'shouldSkipSearch', 'constructSearchQuery'] },
  { query: 'bm25 keyword search', expected: ['Bm25Writer.search', 'Bm25Writer.addDocuments', 'Bm25Writer'] },
  { query: 'vector search hybrid', expected: ['HybridSearch.search', 'LanceDbWriter.vectorSearch', 'reciprocalRankFusion'] },
  { query: 'resolve symbol relationships', expected: ['RelationResolver.resolve', 'handleFindRelated', 'RelationResolver'] },
  { query: 'lancedb writer', expected: ['LanceDbWriterLive', 'LanceDbWriter.upsert', 'LanceDbWriter'] },
  { query: 'parse JSDoc tags', expected: ['JsDocExtractor', 'extractJSDoc', 'JSDoc'] },
];

const lowercase = (value) => Str.toLowerCase(value);

const rowText = (row) => lowercase(`${row.id} ${row.name} ${row.kind} ${row.module} ${row.description} ${row.signature}`);

const scoreQuery = (rows, expected) => {
  const expectedLower = expected.map(lowercase);
  const relevant = rows.filter((row) => expectedLower.some((token) => rowText(row).includes(token)));
  const precisionAtK = rows.length === 0 ? 0 : relevant.length / rows.length;
  const top1Relevant = rows.length > 0 ? expectedLower.some((token) => rowText(rows[0]).includes(token)) : false;
  return {
    returned: rows.length,
    relevant: relevant.length,
    precisionAtK,
    top1Relevant,
    matchingIds: relevant.map((r) => r.id),
  };
};

const runHook = (entryPath, payload) => {
  const start = performance.now();
  const proc = spawnSync('bun', [entryPath], {
    cwd: rootDir,
    input: JSON.stringify(payload),
    encoding: 'utf8',
    timeout: 10000,
  });
  return {
    ms: Number((performance.now() - start).toFixed(2)),
    status: proc.status,
    stdout: proc.stdout ?? '',
    stderr: proc.stderr ?? '',
    error: proc.error ? String(proc.error) : null,
  };
};

const indexerLayer = Layer.mergeAll(
  EmbeddingServiceLive,
  LanceDbWriterLive(indexPath),
  Bm25WriterLive(indexPath),
);

const searchPipelineLayer = Layer.mergeAll(HybridSearchLive, RelationResolverLive, PipelineLive).pipe(
  Layer.provideMerge(indexerLayer),
);

const runtimeLayer = Layer.mergeAll(searchPipelineLayer, NodeFileSystem.layer, NodePath.layer);

const attempt = (label, effect) =>
  Effect.gen(function* () {
    const started = performance.now();
    const result = yield* effect.pipe(
      Effect.match({
        onFailure: (error) => ({ ok: false, error }),
        onSuccess: (value) => ({ ok: true, value }),
      }),
    );
    const ms = Number((performance.now() - started).toFixed(2));
    if (!result.ok) {
      const failure = result.error;
      return {
        label,
        ok: false,
        ms,
        error: {
          tag: failure?._tag ?? 'UnknownError',
          message: failure?.message ?? String(failure),
          phase: failure?.phase ?? null,
        },
      };
    }
    return {
      label,
      ok: true,
      ms,
      value: result.value,
    };
  });

const runEffects = Effect.gen(function* () {
  const results = {
    rootDir,
    indexPath,
    attempts: {},
    latencySamples: {
      search_codebase_ms: [],
      find_related_ms: [],
      browse_symbols_ms: [],
      reindex_incremental_ms: [],
    },
    e2e: {},
    quality: {
      queries: [],
      aggregate: {
        precisionAt3: 0,
        top1Precision: 0,
      },
    },
  };

  const fullReindex = yield* attempt(
    'reindex_full',
    handleReindex({ rootDir, indexPath, mode: 'full' }),
  );
  results.attempts.reindex_full = fullReindex;

  const incrementalReindex = yield* attempt(
    'reindex_incremental',
    handleReindex({ rootDir, indexPath, mode: 'incremental' }),
  );
  results.attempts.reindex_incremental = incrementalReindex;

  const e2eSchema = yield* attempt(
    'e2e_create_account_schema',
    handleSearchCodebase({ query: 'create Account schema', limit: 5 }),
  );
  const e2eErrors = yield* attempt(
    'e2e_add_error_handling',
    handleSearchCodebase({ query: 'add error handling', limit: 5 }),
  );

  results.e2e.create_account_schema = e2eSchema;
  results.e2e.add_error_handling = e2eErrors;

  let seedSymbolId = null;
  if (e2eSchema.ok && e2eSchema.value.results.length > 0) {
    seedSymbolId = e2eSchema.value.results[0].id;
  } else if (e2eErrors.ok && e2eErrors.value.results.length > 0) {
    seedSymbolId = e2eErrors.value.results[0].id;
  }

  for (let i = 0; i < 3; i++) {
    const sample = yield* attempt(
      `latency_search_${i + 1}`,
      handleSearchCodebase({ query: 'create Account schema', limit: 5 }),
    );
    results.latencySamples.search_codebase_ms.push({ ms: sample.ms, ok: sample.ok, error: sample.error ?? null });
  }

  for (let i = 0; i < 3; i++) {
    const sample = yield* attempt(
      `latency_browse_${i + 1}`,
      handleBrowseSymbols({}),
    );
    results.latencySamples.browse_symbols_ms.push({ ms: sample.ms, ok: sample.ok, error: sample.error ?? null });
  }

  if (seedSymbolId !== null) {
    for (let i = 0; i < 3; i++) {
      const sample = yield* attempt(
        `latency_find_related_${i + 1}`,
        handleFindRelated({ symbolId: seedSymbolId, relation: 'similar', limit: 5 }),
      );
      results.latencySamples.find_related_ms.push({ ms: sample.ms, ok: sample.ok, error: sample.error ?? null });
    }
  } else {
    results.latencySamples.find_related_ms.push({
      ms: null,
      ok: false,
      error: { tag: 'NoSeedSymbol', message: 'No symbol id available from E2E searches', phase: null },
    });
  }

  for (let i = 0; i < 2; i++) {
    const sample = yield* attempt(
      `latency_reindex_incremental_${i + 1}`,
      handleReindex({ rootDir, indexPath, mode: 'incremental' }),
    );
    results.latencySamples.reindex_incremental_ms.push({ ms: sample.ms, ok: sample.ok, error: sample.error ?? null });
  }

  let precisionSum = 0;
  let top1Hits = 0;

  for (const qualityCase of qualityQueries) {
    const run = yield* attempt(
      `quality_${qualityCase.query}`,
      handleSearchCodebase({ query: qualityCase.query, limit: 3 }),
    );

    if (run.ok) {
      const scored = scoreQuery(run.value.results, qualityCase.expected);
      precisionSum += scored.precisionAtK;
      if (scored.top1Relevant) {
        top1Hits += 1;
      }
      results.quality.queries.push({
        query: qualityCase.query,
        expected: qualityCase.expected,
        ok: true,
        ms: run.ms,
        topResults: run.value.results,
        scoring: scored,
      });
    } else {
      results.quality.queries.push({
        query: qualityCase.query,
        expected: qualityCase.expected,
        ok: false,
        ms: run.ms,
        error: run.error,
        topResults: [],
        scoring: {
          returned: 0,
          relevant: 0,
          precisionAtK: 0,
          top1Relevant: false,
          matchingIds: [],
        },
      });
    }
  }

  results.quality.aggregate.precisionAt3 = Number(((precisionSum / qualityQueries.length) * 100).toFixed(2));
  results.quality.aggregate.top1Precision = Number(((top1Hits / qualityQueries.length) * 100).toFixed(2));

  return results;
});

const result = await Effect.runPromise(runEffects.pipe(Effect.provide(runtimeLayer)));

let indexMeta = null;
try {
  indexMeta = JSON.parse(readFileSync(join(indexPath, 'index-meta.json'), 'utf8'));
} catch {
  indexMeta = null;
}

const hookSession = runHook('./tooling/codebase-search/dist/hooks/session-start-entry.js', { cwd: rootDir });
const hookPromptCoding = runHook('./tooling/codebase-search/dist/hooks/prompt-submit-entry.js', {
  cwd: rootDir,
  prompt: 'create Account schema with validation and examples',
});
const hookPromptShort = runHook('./tooling/codebase-search/dist/hooks/prompt-submit-entry.js', {
  cwd: rootDir,
  prompt: 'ok',
});
const hookPromptMeta = runHook('./tooling/codebase-search/dist/hooks/prompt-submit-entry.js', {
  cwd: rootDir,
  prompt: 'how does claude code work',
});

const finalPayload = {
  generatedAt: new Date().toISOString(),
  indexMeta,
  ...result,
  hooks: {
    sessionStart: hookSession,
    promptSubmitCoding: hookPromptCoding,
    promptSubmitShort: hookPromptShort,
    promptSubmitMeta: hookPromptMeta,
    checks: {
      sessionStartHasOverview:
        hookSession.status === 0 &&
        hookSession.stdout.includes('## Codebase Index Overview') &&
        hookSession.stdout.includes('symbols') &&
        hookSession.stdout.includes('search_codebase'),
      promptSubmitInjectsContext:
        hookPromptCoding.status === 0 &&
        hookPromptCoding.stdout.includes('<system-reminder>') &&
        hookPromptCoding.stdout.includes('Relevant Existing Code'),
      skipShortPrompt:
        hookPromptShort.status === 0 &&
        Str.trim(hookPromptShort.stdout).length === 0,
      skipMetaPrompt:
        hookPromptMeta.status === 0 &&
        Str.trim(hookPromptMeta.stdout).length === 0,
    },
  },
};

writeFileSync(outputPath, JSON.stringify(finalPayload, null, 2));
console.log(`Wrote ${outputPath}`);
