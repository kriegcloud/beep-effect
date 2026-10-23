// The subset of Vite's `import.meta.glob` signature this package's tests
// use. Vite inlines each matched file's raw UTF-8 text at transform time (the
// yaml and toml `fixture-text.ts` precedent), so a suite reads package sources
// without touching a filesystem at test time.

/** Options for an eager, raw-text glob import. */
interface RawGlobOptions {
  readonly eager: true;
  readonly import: "default";
  readonly query: "?raw";
}

interface ImportMeta {
  glob<T>(pattern: string, options: RawGlobOptions): Record<string, T>;
}
