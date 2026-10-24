// The subset of Vite's `import.meta.glob` signature boundary.test.ts uses: Vite inlines each matched source file's
// raw UTF-8 text at transform time, so the boundary walk reads the package sources without a file system.

/** Options for an eager, raw-text glob import. */
interface RawGlobOptions {
  readonly eager: true;
  readonly import: "default";
  readonly query: "?raw";
}

interface ImportMeta {
  glob<T>(pattern: string, options: RawGlobOptions): Record<string, T>;
}
