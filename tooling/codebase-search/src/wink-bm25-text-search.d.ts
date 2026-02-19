/**
 * Type declarations for the wink-bm25-text-search BM25F in-memory search library.
 * Provides minimal type coverage for the factory function and its returned engine.
 * @since 0.0.0
 */
declare module "wink-bm25-text-search" {
  interface BM25Config {
    readonly fldWeights: Record<string, number>;
    readonly bm25Params: {
      readonly k1: number;
      readonly b: number;
    };
  }

  /** A search result tuple: [docId, score] */
  export type BM25SearchResult = readonly [string, number];

  interface BM25 {
    defineConfig(config: BM25Config): boolean;
    definePrepTasks(tasks: ReadonlyArray<(text: string) => ReadonlyArray<string>>): number;
    addDoc(doc: Record<string, unknown>, id: number): number;
    consolidate(): boolean;
    search(query: string, limit?: number): ReadonlyArray<BM25SearchResult>;
    exportJSON(): string;
    importJSON(json: string): boolean;
    reset(): boolean;
    getTotalDocs(): number;
  }

  export default function bm25fIMS(): BM25;
}
