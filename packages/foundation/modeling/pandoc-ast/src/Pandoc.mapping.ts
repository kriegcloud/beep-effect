/**
 * Compatibility mapping between Pandoc JSON AST and the canonical `@beep/md`
 * document AST.
 *
 * @packageDocumentation \@beep/pandoc-ast/Pandoc.mapping
 * @since 0.0.0
 */

import { $PandocAstId } from "@beep/identity";
import * as Md from "@beep/md/Md.model";
import { A, O } from "@beep/utils";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import {
  BlockQuote,
  BulletList,
  Code,
  CodeBlock,
  Emph,
  Header,
  HorizontalRule,
  Image,
  LineBreak,
  Link,
  OrderedList,
  PandocAttr,
  PandocDocument,
  PandocTarget,
  Para,
  Plain,
  Str,
  Strikeout,
  Strong,
} from "./Pandoc.model.ts";
import { PandocCompatibilityReport, PandocMappingIssue } from "./Pandoc.report.ts";
import type { PandocBlock, PandocInline } from "./Pandoc.model.ts";
import type { JsonPath, PandocMappingDirection, PandocMappingSeverity } from "./Pandoc.report.ts";

const $I = $PandocAstId.create("Pandoc.mapping");

type Projection<Value> = {
  readonly issues: ReadonlyArray<PandocMappingIssue.Type>;
  readonly value: Value;
};

const emptyProjection = <Value>(value: Value): Projection<Value> => ({ issues: [], value });

const mergeIssues = <Value>(values: ReadonlyArray<Projection<Value>>): ReadonlyArray<PandocMappingIssue.Type> =>
  A.flatten(A.map(values, (value) => value.issues));

const issue = (input: {
  readonly construct: string;
  readonly direction: PandocMappingDirection;
  readonly message: string;
  readonly path: JsonPath;
  readonly severity?: PandocMappingSeverity;
}): PandocMappingIssue =>
  PandocMappingIssue.fromPath({
    construct: input.construct,
    direction: input.direction,
    message: input.message,
    path: input.path,
    severity: input.severity ?? "unsupported",
  });

const hasPandocAttr = (attr: PandocAttr.Type): boolean =>
  attr.id.length > 0 || attr.classes.length > 0 || attr.keyValues.length > 0;

const hasTargetTitle = (target: PandocTarget.Type): boolean => target.title.length > 0;

const appendIndex = (path: JsonPath, key: string, index: number): JsonPath => [...path, key, index];

const mdText = (value: string): Md.Text => Md.Text.make({ value });

const mdInlinesText = (inlines: ReadonlyArray<Md.Inline>): string => A.join(A.map(inlines, mdInlineText), "");

const mdInlineText = (inline: Md.Inline): string => {
  if (inline._tag === "text") {
    return inline.value;
  }
  if (inline._tag === "rawMarkdown") {
    return inline.value;
  }
  if (inline._tag === "rawHtml") {
    return inline.value;
  }
  if (inline._tag === "strong" || inline._tag === "em" || inline._tag === "del" || inline._tag === "a") {
    return mdInlinesText(inline.children);
  }
  if (inline._tag === "code") {
    return inline.value;
  }
  if (inline._tag === "img") {
    return inline.alt;
  }
  return "\n";
};

const pandocInlineText = (inline: PandocInline.Type): string => {
  if (inline._tag === "str") {
    return inline.text;
  }
  if (inline._tag === "space") {
    return " ";
  }
  if (inline._tag === "softbreak" || inline._tag === "linebreak") {
    return "\n";
  }
  if (
    inline._tag === "emph" ||
    inline._tag === "strong" ||
    inline._tag === "strikeout" ||
    inline._tag === "link" ||
    inline._tag === "image" ||
    inline._tag === "span"
  ) {
    return A.join(A.map(inline.children, pandocInlineText), "");
  }
  if (inline._tag === "code" || inline._tag === "math") {
    return inline.text;
  }
  if (inline._tag === "note") {
    return A.join(A.map(inline.blocks, pandocBlockText), "\n");
  }
  return "";
};

const pandocBlockText = (block: PandocBlock.Type): string => {
  if (block._tag === "plain" || block._tag === "para" || block._tag === "header") {
    return A.join(A.map(block.children, pandocInlineText), "");
  }
  if (block._tag === "blockquote" || block._tag === "div") {
    return A.join(A.map(block.children, pandocBlockText), "\n");
  }
  if (block._tag === "codeblock") {
    return block.text;
  }
  if (block._tag === "bulletlist" || block._tag === "orderedlist") {
    return A.join(
      A.map(block.items, (item) => A.join(A.map(item, pandocBlockText), "\n")),
      "\n"
    );
  }
  if (block._tag === "table") {
    return A.join(A.map(block.caption, pandocInlineText), "");
  }
  return "";
};

const pandocInlineToMd = (
  inline: PandocInline.Type,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<Md.Inline>>, S.SchemaError> => {
  if (inline._tag === "str") {
    return Effect.succeed(emptyProjection([mdText(inline.text)]));
  }
  if (inline._tag === "space") {
    return Effect.succeed(emptyProjection([mdText(" ")]));
  }
  if (inline._tag === "softbreak" || inline._tag === "linebreak") {
    return Effect.succeed(emptyProjection([Md.Br.make({})]));
  }
  if (inline._tag === "emph") {
    return Effect.map(pandocInlinesToMd(inline.children, path), ({ issues, value }) => ({
      issues,
      value: [Md.Em.make({ children: value })],
    }));
  }
  if (inline._tag === "strong") {
    return Effect.map(pandocInlinesToMd(inline.children, path), ({ issues, value }) => ({
      issues,
      value: [Md.Strong.make({ children: value })],
    }));
  }
  if (inline._tag === "strikeout") {
    return Effect.map(pandocInlinesToMd(inline.children, path), ({ issues, value }) => ({
      issues,
      value: [Md.Del.make({ children: value })],
    }));
  }
  if (inline._tag === "code") {
    const issues = hasPandocAttr(inline.attr)
      ? [
          issue({
            construct: "Code",
            direction: "pandoc-to-md",
            message: "Inline code attributes have no Md-core equivalent.",
            path,
            severity: "lossy",
          }),
        ]
      : [];
    return Effect.succeed({ issues, value: [Md.Code.make({ value: inline.text })] });
  }
  if (inline._tag === "link") {
    return Effect.map(pandocInlinesToMd(inline.children, path), ({ issues, value }) => ({
      issues: [
        ...issues,
        ...(hasPandocAttr(inline.attr) || hasTargetTitle(inline.target)
          ? [
              issue({
                construct: "Link",
                direction: "pandoc-to-md",
                message: "Pandoc link attributes or title are outside Md-core link shape.",
                path,
                severity: "lossy",
              }),
            ]
          : []),
      ],
      value: [Md.A.make({ children: value, href: inline.target.url })],
    }));
  }
  if (inline._tag === "image") {
    const issues =
      hasPandocAttr(inline.attr) || hasTargetTitle(inline.target)
        ? [
            issue({
              construct: "Image",
              direction: "pandoc-to-md",
              message: "Pandoc image attributes or title are outside Md-core image shape.",
              path,
              severity: "lossy",
            }),
          ]
        : [];
    return Effect.succeed({
      issues,
      value: [Md.Img.make({ alt: A.join(A.map(inline.children, pandocInlineText), ""), src: inline.target.url })],
    });
  }
  if (inline._tag === "span") {
    return Effect.map(pandocInlinesToMd(inline.children, path), ({ issues, value }) => ({
      issues: [
        ...issues,
        ...(hasPandocAttr(inline.attr)
          ? [
              issue({
                construct: "Span",
                direction: "pandoc-to-md",
                message: "Pandoc span attributes, including DOCX custom styles, are recorded as a gap.",
                path,
              }),
            ]
          : []),
      ],
      value,
    }));
  }
  if (inline._tag === "note") {
    return Effect.succeed({
      issues: [
        issue({
          construct: "Note",
          direction: "pandoc-to-md",
          message: "Pandoc notes are outside Md-core and are degraded to plain text.",
          path,
        }),
      ],
      value: [mdText(pandocInlineText(inline))],
    });
  }
  if (inline._tag === "math") {
    return Effect.succeed({
      issues: [
        issue({
          construct: "Math",
          direction: "pandoc-to-md",
          message: "Pandoc math is outside Md-core and is degraded to plain text.",
          path,
        }),
      ],
      value: [mdText(inline.text)],
    });
  }
  return Effect.succeed({
    issues: [
      issue({
        construct: inline.constructor,
        direction: "pandoc-to-md",
        message: "Pandoc inline constructor is outside the v1 supported surface.",
        path,
      }),
    ],
    value: [],
  });
};

const pandocInlinesToMd = (
  inlines: ReadonlyArray<PandocInline.Type>,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<Md.Inline>>, S.SchemaError> =>
  Effect.map(
    Effect.forEach(inlines, (inline, index) => pandocInlineToMd(inline, appendIndex(path, "children", index))),
    (values) => ({
      issues: mergeIssues(values),
      value: A.flatten(A.map(values, (item) => item.value)),
    })
  );

const headingToMd = (level: number, children: ReadonlyArray<Md.Inline>): Md.Block => {
  if (level === 1) {
    return Md.H1.make({ children });
  }
  if (level === 2) {
    return Md.H2.make({ children });
  }
  if (level === 3) {
    return Md.H3.make({ children });
  }
  if (level === 4) {
    return Md.H4.make({ children });
  }
  if (level === 5) {
    return Md.H5.make({ children });
  }
  if (level === 6) {
    return Md.H6.make({ children });
  }
  return Md.P.make({ children });
};

const pandocListItemToMd = (
  item: ReadonlyArray<PandocBlock.Type>,
  path: JsonPath
): Effect.Effect<Projection<Md.Li>, S.SchemaError> =>
  Effect.map(
    Effect.forEach(item, (block, index) => pandocBlockToMd(block, appendIndex(path, "blocks", index))),
    (blocks) => ({
      issues: mergeIssues(blocks),
      value: Md.Li.make({
        children: [
          mdText(
            A.join(
              A.map(blocks, (block) => mdBlockText(block.value)),
              "\n"
            )
          ),
        ],
      }),
    })
  );

const mdBlockText = (block: Md.Block): string => {
  if (
    block._tag === "h1" ||
    block._tag === "h2" ||
    block._tag === "h3" ||
    block._tag === "h4" ||
    block._tag === "h5" ||
    block._tag === "h6" ||
    block._tag === "p" ||
    block._tag === "li"
  ) {
    return mdInlinesText(block.children);
  }
  if (block._tag === "blockquote") {
    return A.join(A.map(block.children, mdBlockText), "\n");
  }
  if (block._tag === "pre") {
    return block.value;
  }
  if (block._tag === "ul" || block._tag === "ol") {
    return A.join(
      A.map(block.children, (item) => mdInlinesText(item.children)),
      "\n"
    );
  }
  if (block._tag === "taskList") {
    return A.join(
      A.map(block.children, (item) => mdInlinesText(item.children)),
      "\n"
    );
  }
  return "";
};

const pandocBlockToMd = (
  block: PandocBlock.Type,
  path: JsonPath
): Effect.Effect<Projection<Md.Block>, S.SchemaError> => {
  if (block._tag === "plain" || block._tag === "para") {
    return Effect.map(pandocInlinesToMd(block.children, path), ({ issues, value }) => ({
      issues,
      value: Md.P.make({ children: value }),
    }));
  }
  if (block._tag === "header") {
    return Effect.map(pandocInlinesToMd(block.children, path), ({ issues, value }) => ({
      issues: [
        ...issues,
        ...(block.level < 1 || block.level > 6
          ? [
              issue({
                construct: "Header",
                direction: "pandoc-to-md",
                message: "Header level outside 1..6 is degraded to a paragraph.",
                path,
                severity: "lossy",
              }),
            ]
          : []),
      ],
      value: headingToMd(block.level, value),
    }));
  }
  if (block._tag === "blockquote") {
    return Effect.map(
      Effect.forEach(block.children, (child, index) => pandocBlockToMd(child, appendIndex(path, "children", index))),
      (children) => ({
        issues: mergeIssues(children),
        value: Md.BlockQuote.make({ children: A.map(children, (child) => child.value) }),
      })
    );
  }
  if (block._tag === "codeblock") {
    return Effect.succeed(
      emptyProjection(Md.Pre.make({ language: O.fromUndefinedOr(block.attr.classes[0]), value: block.text }))
    );
  }
  if (block._tag === "bulletlist") {
    return Effect.map(
      Effect.forEach(block.items, (item, index) => pandocListItemToMd(item, appendIndex(path, "items", index))),
      (items) => ({
        issues: mergeIssues(items),
        value: Md.Ul.make({ children: A.map(items, (item) => item.value) }),
      })
    );
  }
  if (block._tag === "orderedlist") {
    return Effect.map(
      Effect.forEach(block.items, (item, index) => pandocListItemToMd(item, appendIndex(path, "items", index))),
      (items) => ({
        issues: mergeIssues(items),
        value: Md.Ol.make({ children: A.map(items, (item) => item.value) }),
      })
    );
  }
  if (block._tag === "horizontalrule") {
    return Effect.succeed(emptyProjection(Md.Hr.make({})));
  }
  if (block._tag === "div") {
    return Effect.map(
      Effect.forEach(block.children, (child, index) => pandocBlockToMd(child, appendIndex(path, "children", index))),
      (children) => ({
        issues: [
          ...mergeIssues(children),
          ...(hasPandocAttr(block.attr)
            ? [
                issue({
                  construct: "Div",
                  direction: "pandoc-to-md",
                  message: "Pandoc div attributes, including DOCX custom styles, are recorded as a gap.",
                  path,
                }),
              ]
            : []),
        ],
        value: Md.BlockQuote.make({ children: A.map(children, (child) => child.value) }),
      })
    );
  }
  if (block._tag === "table") {
    const caption = A.join(A.map(block.caption, pandocInlineText), "");
    return Effect.succeed({
      issues: [
        issue({
          construct: "Table",
          direction: "pandoc-to-md",
          message: "Pandoc tables are outside the v1 Md-core profile.",
          path,
        }),
      ],
      value: Md.P.make({ children: [mdText(caption.length === 0 ? "[table]" : caption)] }),
    });
  }
  return Effect.succeed({
    issues: [
      issue({
        construct: block.constructor,
        direction: "pandoc-to-md",
        message: "Pandoc block constructor is outside the v1 supported surface.",
        path,
      }),
    ],
    value: Md.P.make({ children: [mdText(`[${block.constructor}]`)] }),
  });
};

const mdInlineToPandoc = (
  inline: Md.Inline,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<PandocInline.Type>>, S.SchemaError> => {
  if (inline._tag === "text") {
    return Effect.succeed(emptyProjection([Str.make({ text: inline.value })]));
  }
  if (inline._tag === "rawMarkdown" || inline._tag === "rawHtml") {
    return Effect.succeed({
      issues: [
        issue({
          construct: inline._tag,
          direction: "md-to-pandoc",
          message: "Trusted raw Markdown or HTML is degraded to Pandoc plain text.",
          path,
          severity: "lossy",
        }),
      ],
      value: [Str.make({ text: inline.value })],
    });
  }
  if (inline._tag === "strong") {
    return Effect.map(mdInlinesToPandoc(inline.children, path), ({ issues, value }) => ({
      issues,
      value: [Strong.make({ children: value })],
    }));
  }
  if (inline._tag === "em") {
    return Effect.map(mdInlinesToPandoc(inline.children, path), ({ issues, value }) => ({
      issues,
      value: [Emph.make({ children: value })],
    }));
  }
  if (inline._tag === "del") {
    return Effect.map(mdInlinesToPandoc(inline.children, path), ({ issues, value }) => ({
      issues,
      value: [Strikeout.make({ children: value })],
    }));
  }
  if (inline._tag === "code") {
    return Effect.succeed(emptyProjection([Code.make({ attr: PandocAttr.empty, text: inline.value })]));
  }
  if (inline._tag === "a") {
    return Effect.map(mdInlinesToPandoc(inline.children, path), ({ issues, value }) => ({
      issues,
      value: [
        Link.make({
          attr: PandocAttr.empty,
          children: value,
          target: PandocTarget.make({ title: "", url: inline.href }),
        }),
      ],
    }));
  }
  if (inline._tag === "img") {
    return Effect.succeed(
      emptyProjection([
        Image.make({
          attr: PandocAttr.empty,
          children: [Str.make({ text: inline.alt })],
          target: PandocTarget.make({ title: "", url: inline.src }),
        }),
      ])
    );
  }
  return Effect.succeed(emptyProjection([LineBreak.make({})]));
};

const mdInlinesToPandoc = (
  inlines: ReadonlyArray<Md.Inline>,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<PandocInline.Type>>, S.SchemaError> =>
  Effect.map(
    Effect.forEach(inlines, (inline, index) => mdInlineToPandoc(inline, appendIndex(path, "children", index))),
    (values) => ({
      issues: mergeIssues(values),
      value: A.flatten(A.map(values, (item) => item.value)),
    })
  );

const headingLevel = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"): number =>
  tag === "h1" ? 1 : tag === "h2" ? 2 : tag === "h3" ? 3 : tag === "h4" ? 4 : tag === "h5" ? 5 : 6;

const mdBlockToPandoc = (
  block: Md.Block,
  path: JsonPath
): Effect.Effect<Projection<PandocBlock.Type>, S.SchemaError> => {
  if (
    block._tag === "h1" ||
    block._tag === "h2" ||
    block._tag === "h3" ||
    block._tag === "h4" ||
    block._tag === "h5" ||
    block._tag === "h6"
  ) {
    return Effect.map(mdInlinesToPandoc(block.children, path), ({ issues, value }) => ({
      issues,
      value: Header.make({ attr: PandocAttr.empty, children: value, level: headingLevel(block._tag) }),
    }));
  }
  if (block._tag === "p") {
    return Effect.map(mdInlinesToPandoc(block.children, path), ({ issues, value }) => ({
      issues,
      value: Para.make({ children: value }),
    }));
  }
  if (block._tag === "blockquote") {
    return Effect.map(
      Effect.forEach(block.children, (child, index) => mdBlockToPandoc(child, appendIndex(path, "children", index))),
      (children) => ({
        issues: mergeIssues(children),
        value: BlockQuote.make({ children: A.map(children, (child) => child.value) }),
      })
    );
  }
  if (block._tag === "pre") {
    return Effect.succeed(
      emptyProjection(
        CodeBlock.make({
          attr: PandocAttr.make({
            classes: O.match({ onNone: () => [], onSome: (language: string) => [language] })(block.language),
            id: "",
            keyValues: [],
          }),
          text: block.value,
        })
      )
    );
  }
  if (block._tag === "ul") {
    return Effect.succeed(
      emptyProjection(
        BulletList.make({
          items: A.map(block.children, (item) => [
            Plain.make({ children: A.map(item.children, (child) => Str.make({ text: mdInlineText(child) })) }),
          ]),
        })
      )
    );
  }
  if (block._tag === "ol") {
    return Effect.succeed(
      emptyProjection(
        OrderedList.make({
          delimiter: "DefaultDelim",
          items: A.map(block.children, (item) => [
            Plain.make({ children: A.map(item.children, (child) => Str.make({ text: mdInlineText(child) })) }),
          ]),
          start: 1,
          style: "DefaultStyle",
        })
      )
    );
  }
  if (block._tag === "li") {
    return Effect.map(mdInlinesToPandoc(block.children, path), ({ issues, value }) => ({
      issues,
      value: Plain.make({ children: value }),
    }));
  }
  if (block._tag === "taskList") {
    return Effect.succeed({
      issues: [
        issue({
          construct: "TaskList",
          direction: "md-to-pandoc",
          message: "Md task list checked state has no v1 Pandoc-core mapping and is emitted as a bullet list.",
          path,
          severity: "lossy",
        }),
      ],
      value: BulletList.make({
        items: A.map(block.children, (item) => [
          Plain.make({ children: [Str.make({ text: mdInlinesText(item.children) })] }),
        ]),
      }),
    });
  }
  return Effect.succeed(emptyProjection(HorizontalRule.make({})));
};

/**
 * Result of mapping a Pandoc document to `@beep/md`.
 *
 * @category models
 * @since 0.0.0
 */
export class PandocToDocumentResult extends S.Class<PandocToDocumentResult>($I`PandocToDocumentResult`)(
  {
    document: Md.Document.annotateKey({
      description: "Mapped Md document.",
    }),
    report: PandocCompatibilityReport.annotateKey({
      description: "Compatibility report for the mapping.",
    }),
  },
  $I.annote("PandocToDocumentResult", {
    description: "Result of mapping a Pandoc document to @beep/md.",
  })
) {}

/**
 * Companion namespace for {@link PandocToDocumentResult}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace PandocToDocumentResult {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly document: Md.Document.Type;
    readonly report: PandocCompatibilityReport.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly document: Md.Document.Encoded;
    readonly report: PandocCompatibilityReport.Encoded;
  }
}

/**
 * Result of mapping an `@beep/md` document to Pandoc.
 *
 * @category models
 * @since 0.0.0
 */
export class DocumentToPandocResult extends S.Class<DocumentToPandocResult>($I`DocumentToPandocResult`)(
  {
    pandoc: PandocDocument.annotateKey({
      description: "Mapped Pandoc document.",
    }),
    report: PandocCompatibilityReport.annotateKey({
      description: "Compatibility report for the mapping.",
    }),
  },
  $I.annote("DocumentToPandocResult", {
    description: "Result of mapping an @beep/md document to Pandoc.",
  })
) {}

/**
 * Companion namespace for {@link DocumentToPandocResult}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace DocumentToPandocResult {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly pandoc: PandocDocument.Type;
    readonly report: PandocCompatibilityReport.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly pandoc: PandocDocument.Encoded;
    readonly report: PandocCompatibilityReport.Encoded;
  }
}

/**
 * Maps a Pandoc document into the canonical `@beep/md` AST with a structured
 * compatibility report.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { pandocToDocument } from "@beep/pandoc-ast/Pandoc.mapping"
 * import { PandocDocument } from "@beep/pandoc-ast/Pandoc.model"
 *
 * const result = Effect.runSync(pandocToDocument(PandocDocument.make({ apiVersion: [1, 23, 1], blocks: [], meta: {} })))
 * console.log(result.report.profile)
 * ```
 *
 * @category mapping
 * @since 0.0.0
 */
export const pandocToDocument = (pandoc: PandocDocument.Type): Effect.Effect<PandocToDocumentResult, S.SchemaError> =>
  Effect.map(
    Effect.forEach(pandoc.blocks, (block, index) => pandocBlockToMd(block, ["blocks", index])),
    (blocks) =>
      PandocToDocumentResult.make({
        document: Md.Document.make({ children: A.map(blocks, (block) => block.value) }),
        report: PandocCompatibilityReport.fromIssues(mergeIssues(blocks)),
      })
  );

/**
 * Maps the canonical `@beep/md` AST into a Pandoc document with a structured
 * compatibility report.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import * as Md from "@beep/md/Md.model"
 * import { documentToPandoc } from "@beep/pandoc-ast/Pandoc.mapping"
 *
 * const result = Effect.runSync(documentToPandoc(Md.Document.make({ children: [] })))
 * console.log(result.pandoc.blocks.length)
 * ```
 *
 * @category mapping
 * @since 0.0.0
 */
export const documentToPandoc = (document: Md.Document.Type): Effect.Effect<DocumentToPandocResult, S.SchemaError> =>
  Effect.map(
    Effect.forEach(document.children, (block, index) => mdBlockToPandoc(block, ["children", index])),
    (blocks) =>
      DocumentToPandocResult.make({
        pandoc: PandocDocument.make({
          apiVersion: [1, 23, 1],
          blocks: A.map(blocks, (block) => block.value),
          meta: {},
        }),
        report: PandocCompatibilityReport.fromIssues(mergeIssues(blocks)),
      })
  );
