declare module "@effect/markdown-toc" {
  export interface MarkdownTocOptions {
    readonly bullets?: string | undefined;
  }

  export interface MarkdownTocResult {
    readonly content: string;
  }

  const markdownToc: (markdown: string, options?: MarkdownTocOptions) => MarkdownTocResult;

  export default markdownToc;
}
