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
import { Effect, Match } from "effect";
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

const projectChildValues = <Input, Output>(
  values: ReadonlyArray<Input>,
  path: JsonPath,
  project: (value: Input, path: JsonPath) => Effect.Effect<Projection<ReadonlyArray<Output>>, S.SchemaError>
): Effect.Effect<Projection<ReadonlyArray<Output>>, S.SchemaError> =>
  Effect.map(
    Effect.forEach(values, (value, index) => project(value, appendIndex(path, "children", index))),
    (projected) => ({
      issues: mergeIssues(projected),
      value: A.flatten(A.map(projected, (item) => item.value)),
    })
  );

const mdText = (value: string): Md.Text => Md.Text.make({ value });

const mdInlinesText = (inlines: ReadonlyArray<Md.Inline>): string => A.join(A.map(inlines, mdInlineText), "");

const mdInlineText: (inline: Md.Inline) => string = Match.type<Md.Inline>().pipe(
  Match.tagsExhaustive({
    text: (inline) => inline.value,
    rawMarkdown: (inline) => inline.value,
    rawHtml: (inline) => inline.value,
    strong: (inline) => mdInlinesText(inline.children),
    em: (inline) => mdInlinesText(inline.children),
    del: (inline) => mdInlinesText(inline.children),
    code: (inline) => inline.value,
    a: (inline) => mdInlinesText(inline.children),
    img: (inline) => inline.alt,
    br: () => "\n",
  })
);

const pandocInlineText: (inline: PandocInline.Type) => string = Match.type<PandocInline.Type>().pipe(
  Match.tagsExhaustive({
    str: (inline) => inline.text,
    space: () => " ",
    softbreak: () => "\n",
    linebreak: () => "\n",
    emph: (inline) => A.join(A.map(inline.children, pandocInlineText), ""),
    strong: (inline) => A.join(A.map(inline.children, pandocInlineText), ""),
    strikeout: (inline) => A.join(A.map(inline.children, pandocInlineText), ""),
    code: (inline) => inline.text,
    link: (inline) => A.join(A.map(inline.children, pandocInlineText), ""),
    image: (inline) => A.join(A.map(inline.children, pandocInlineText), ""),
    span: (inline) => A.join(A.map(inline.children, pandocInlineText), ""),
    note: (inline) => A.join(A.map(inline.blocks, pandocBlockText), "\n"),
    math: (inline) => inline.text,
    unknownInline: () => "",
  })
);

const pandocBlockText: (block: PandocBlock.Type) => string = Match.type<PandocBlock.Type>().pipe(
  Match.tagsExhaustive({
    plain: (block) => A.join(A.map(block.children, pandocInlineText), ""),
    para: (block) => A.join(A.map(block.children, pandocInlineText), ""),
    header: (block) => A.join(A.map(block.children, pandocInlineText), ""),
    blockquote: (block) => A.join(A.map(block.children, pandocBlockText), "\n"),
    codeblock: (block) => block.text,
    bulletlist: (block) =>
      A.join(
        A.map(block.items, (item) => A.join(A.map(item, pandocBlockText), "\n")),
        "\n"
      ),
    orderedlist: (block) =>
      A.join(
        A.map(block.items, (item) => A.join(A.map(item, pandocBlockText), "\n")),
        "\n"
      ),
    horizontalrule: () => "",
    div: (block) => A.join(A.map(block.children, pandocBlockText), "\n"),
    table: (block) => A.join(A.map(block.caption, pandocInlineText), ""),
    unknownBlock: () => "",
  })
);

const pandocInlineToMd = (
  inline: PandocInline.Type,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<Md.Inline>>, S.SchemaError> =>
  Match.value(inline).pipe(
    Match.tagsExhaustive({
      str: (node) => Effect.succeed(emptyProjection([mdText(node.text)])),
      space: () => Effect.succeed(emptyProjection([mdText(" ")])),
      softbreak: () => Effect.succeed(emptyProjection([Md.Br.make({})])),
      linebreak: () => Effect.succeed(emptyProjection([Md.Br.make({})])),
      emph: (node) =>
        Effect.map(pandocInlinesToMd(node.children, path), ({ issues, value }) => ({
          issues,
          value: [Md.Em.make({ children: value })],
        })),
      strong: (node) =>
        Effect.map(pandocInlinesToMd(node.children, path), ({ issues, value }) => ({
          issues,
          value: [Md.Strong.make({ children: value })],
        })),
      strikeout: (node) =>
        Effect.map(pandocInlinesToMd(node.children, path), ({ issues, value }) => ({
          issues,
          value: [Md.Del.make({ children: value })],
        })),
      code: (node) =>
        Effect.succeed({
          issues: hasPandocAttr(node.attr)
            ? [
                issue({
                  construct: "Code",
                  direction: "pandoc-to-md",
                  message: "Inline code attributes have no Md-core equivalent.",
                  path,
                  severity: "lossy",
                }),
              ]
            : [],
          value: [Md.Code.make({ value: node.text })],
        }),
      link: (node) =>
        Effect.map(pandocInlinesToMd(node.children, path), ({ issues, value }) => ({
          issues: [
            ...issues,
            ...(hasPandocAttr(node.attr) || hasTargetTitle(node.target)
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
          value: [Md.A.make({ children: value, href: node.target.url })],
        })),
      image: (node) =>
        Effect.succeed({
          issues:
            hasPandocAttr(node.attr) || hasTargetTitle(node.target)
              ? [
                  issue({
                    construct: "Image",
                    direction: "pandoc-to-md",
                    message: "Pandoc image attributes or title are outside Md-core image shape.",
                    path,
                    severity: "lossy",
                  }),
                ]
              : [],
          value: [Md.Img.make({ alt: A.join(A.map(node.children, pandocInlineText), ""), src: node.target.url })],
        }),
      span: (node) =>
        Effect.map(pandocInlinesToMd(node.children, path), ({ issues, value }) => ({
          issues: [
            ...issues,
            ...(hasPandocAttr(node.attr)
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
        })),
      note: (node) =>
        Effect.succeed({
          issues: [
            issue({
              construct: "Note",
              direction: "pandoc-to-md",
              message: "Pandoc notes are outside Md-core and are degraded to plain text.",
              path,
            }),
          ],
          value: [mdText(pandocInlineText(node))],
        }),
      math: (node) =>
        Effect.succeed({
          issues: [
            issue({
              construct: "Math",
              direction: "pandoc-to-md",
              message: "Pandoc math is outside Md-core and is degraded to plain text.",
              path,
            }),
          ],
          value: [mdText(node.text)],
        }),
      unknownInline: (node) =>
        Effect.succeed({
          issues: [
            issue({
              construct: node.constructor,
              direction: "pandoc-to-md",
              message: "Pandoc inline constructor is outside the v1 supported surface.",
              path,
            }),
          ],
          value: [],
        }),
    })
  );

const pandocInlinesToMd = (
  inlines: ReadonlyArray<PandocInline.Type>,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<Md.Inline>>, S.SchemaError> =>
  projectChildValues(inlines, path, pandocInlineToMd);

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

const mdListText = (items: ReadonlyArray<Md.Li | Md.TaskItem>): string =>
  A.join(
    A.map(items, (item) => mdInlinesText(item.children)),
    "\n"
  );

const mdBlockText: (block: Md.Block) => string = Match.type<Md.Block>().pipe(
  Match.tagsExhaustive({
    h1: (block) => mdInlinesText(block.children),
    h2: (block) => mdInlinesText(block.children),
    h3: (block) => mdInlinesText(block.children),
    h4: (block) => mdInlinesText(block.children),
    h5: (block) => mdInlinesText(block.children),
    h6: (block) => mdInlinesText(block.children),
    p: (block) => mdInlinesText(block.children),
    blockquote: (block) => A.join(A.map(block.children, mdBlockText), "\n"),
    pre: (block) => block.value,
    ul: (block) => mdListText(block.children),
    ol: (block) => mdListText(block.children),
    li: (block) => mdInlinesText(block.children),
    taskList: (block) => mdListText(block.children),
    hr: () => "",
  })
);

const pandocChildBlocksToMd = (
  children: ReadonlyArray<PandocBlock.Type>,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<Md.Block>>, S.SchemaError> =>
  Effect.map(
    Effect.forEach(children, (child, index) => pandocBlockToMd(child, appendIndex(path, "children", index))),
    (values) => ({
      issues: mergeIssues(values),
      value: A.map(values, (child) => child.value),
    })
  );

const pandocListItemsToMd = (
  items: ReadonlyArray<ReadonlyArray<PandocBlock.Type>>,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<Md.Li>>, S.SchemaError> =>
  Effect.map(
    Effect.forEach(items, (item, index) => pandocListItemToMd(item, appendIndex(path, "items", index))),
    (values) => ({
      issues: mergeIssues(values),
      value: A.map(values, (item) => item.value),
    })
  );

const pandocBlockToMd = (block: PandocBlock.Type, path: JsonPath): Effect.Effect<Projection<Md.Block>, S.SchemaError> =>
  Match.value(block).pipe(
    Match.tagsExhaustive({
      plain: (node) =>
        Effect.map(pandocInlinesToMd(node.children, path), ({ issues, value }) => ({
          issues,
          value: Md.P.make({ children: value }),
        })),
      para: (node) =>
        Effect.map(pandocInlinesToMd(node.children, path), ({ issues, value }) => ({
          issues,
          value: Md.P.make({ children: value }),
        })),
      header: (node) =>
        Effect.map(pandocInlinesToMd(node.children, path), ({ issues, value }) => ({
          issues: [
            ...issues,
            ...(node.level < 1 || node.level > 6
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
          value: headingToMd(node.level, value),
        })),
      blockquote: (node) =>
        Effect.map(pandocChildBlocksToMd(node.children, path), ({ issues, value }) => ({
          issues,
          value: Md.BlockQuote.make({ children: value }),
        })),
      codeblock: (node) =>
        Effect.succeed(
          emptyProjection(Md.Pre.make({ language: O.fromUndefinedOr(node.attr.classes[0]), value: node.text }))
        ),
      bulletlist: (node) =>
        Effect.map(pandocListItemsToMd(node.items, path), ({ issues, value }) => ({
          issues,
          value: Md.Ul.make({ children: value }),
        })),
      orderedlist: (node) =>
        Effect.map(pandocListItemsToMd(node.items, path), ({ issues, value }) => ({
          issues,
          value: Md.Ol.make({ children: value }),
        })),
      horizontalrule: () => Effect.succeed(emptyProjection(Md.Hr.make({}))),
      div: (node) =>
        Effect.map(pandocChildBlocksToMd(node.children, path), ({ issues, value }) => ({
          issues: [
            ...issues,
            ...(hasPandocAttr(node.attr)
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
          value: Md.BlockQuote.make({ children: value }),
        })),
      table: (node) => {
        const caption = A.join(A.map(node.caption, pandocInlineText), "");
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
      },
      unknownBlock: (node) =>
        Effect.succeed({
          issues: [
            issue({
              construct: node.constructor,
              direction: "pandoc-to-md",
              message: "Pandoc block constructor is outside the v1 supported surface.",
              path,
            }),
          ],
          value: Md.P.make({ children: [mdText(`[${node.constructor}]`)] }),
        }),
    })
  );

const mdInlineToPandoc = (
  inline: Md.Inline,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<PandocInline.Type>>, S.SchemaError> =>
  Match.value(inline).pipe(
    Match.tagsExhaustive({
      text: (node) => Effect.succeed(emptyProjection([Str.make({ text: node.value })])),
      rawMarkdown: (node) =>
        Effect.succeed({
          issues: [
            issue({
              construct: node._tag,
              direction: "md-to-pandoc",
              message: "Trusted raw Markdown or HTML is degraded to Pandoc plain text.",
              path,
              severity: "lossy",
            }),
          ],
          value: [Str.make({ text: node.value })],
        }),
      rawHtml: (node) =>
        Effect.succeed({
          issues: [
            issue({
              construct: node._tag,
              direction: "md-to-pandoc",
              message: "Trusted raw Markdown or HTML is degraded to Pandoc plain text.",
              path,
              severity: "lossy",
            }),
          ],
          value: [Str.make({ text: node.value })],
        }),
      strong: (node) =>
        Effect.map(mdInlinesToPandoc(node.children, path), ({ issues, value }) => ({
          issues,
          value: [Strong.make({ children: value })],
        })),
      em: (node) =>
        Effect.map(mdInlinesToPandoc(node.children, path), ({ issues, value }) => ({
          issues,
          value: [Emph.make({ children: value })],
        })),
      del: (node) =>
        Effect.map(mdInlinesToPandoc(node.children, path), ({ issues, value }) => ({
          issues,
          value: [Strikeout.make({ children: value })],
        })),
      code: (node) => Effect.succeed(emptyProjection([Code.make({ attr: PandocAttr.empty, text: node.value })])),
      a: (node) =>
        Effect.map(mdInlinesToPandoc(node.children, path), ({ issues, value }) => ({
          issues,
          value: [
            Link.make({
              attr: PandocAttr.empty,
              children: value,
              target: PandocTarget.make({ title: "", url: node.href }),
            }),
          ],
        })),
      img: (node) =>
        Effect.succeed(
          emptyProjection([
            Image.make({
              attr: PandocAttr.empty,
              children: [Str.make({ text: node.alt })],
              target: PandocTarget.make({ title: "", url: node.src }),
            }),
          ])
        ),
      br: () => Effect.succeed(emptyProjection([LineBreak.make({})])),
    })
  );

const mdInlinesToPandoc = (
  inlines: ReadonlyArray<Md.Inline>,
  path: JsonPath
): Effect.Effect<Projection<ReadonlyArray<PandocInline.Type>>, S.SchemaError> =>
  projectChildValues(inlines, path, mdInlineToPandoc);

const headingLevel = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"): number =>
  Match.value(tag).pipe(
    Match.when("h1", () => 1),
    Match.when("h2", () => 2),
    Match.when("h3", () => 3),
    Match.when("h4", () => 4),
    Match.when("h5", () => 5),
    Match.orElse(() => 6)
  );

type MdHeading = Md.H1 | Md.H2 | Md.H3 | Md.H4 | Md.H5 | Md.H6;

const mdHeadingToPandoc = (
  node: MdHeading,
  path: JsonPath
): Effect.Effect<Projection<PandocBlock.Type>, S.SchemaError> =>
  Effect.map(mdInlinesToPandoc(node.children, path), ({ issues, value }) => ({
    issues,
    value: Header.make({ attr: PandocAttr.empty, children: value, level: headingLevel(node._tag) }),
  }));

const mdListItemPlainBlocks = (
  items: ReadonlyArray<Md.Li | Md.TaskItem>
): ReadonlyArray<ReadonlyArray<PandocBlock.Type>> =>
  A.map(items, (item) => [
    Plain.make({ children: A.map(item.children, (child) => Str.make({ text: mdInlineText(child) })) }),
  ]);

const mdBlockToPandoc = (block: Md.Block, path: JsonPath): Effect.Effect<Projection<PandocBlock.Type>, S.SchemaError> =>
  Match.value(block).pipe(
    Match.tagsExhaustive({
      h1: (node) => mdHeadingToPandoc(node, path),
      h2: (node) => mdHeadingToPandoc(node, path),
      h3: (node) => mdHeadingToPandoc(node, path),
      h4: (node) => mdHeadingToPandoc(node, path),
      h5: (node) => mdHeadingToPandoc(node, path),
      h6: (node) => mdHeadingToPandoc(node, path),
      p: (node) =>
        Effect.map(mdInlinesToPandoc(node.children, path), ({ issues, value }) => ({
          issues,
          value: Para.make({ children: value }),
        })),
      blockquote: (node) =>
        Effect.map(
          Effect.forEach(node.children, (child, index) => mdBlockToPandoc(child, appendIndex(path, "children", index))),
          (children) => ({
            issues: mergeIssues(children),
            value: BlockQuote.make({ children: A.map(children, (child) => child.value) }),
          })
        ),
      pre: (node) =>
        Effect.succeed(
          emptyProjection(
            CodeBlock.make({
              attr: PandocAttr.make({
                classes: O.match({ onNone: () => [], onSome: (language: string) => [language] })(node.language),
                id: "",
                keyValues: [],
              }),
              text: node.value,
            })
          )
        ),
      ul: (node) =>
        Effect.succeed(
          emptyProjection(
            BulletList.make({
              items: mdListItemPlainBlocks(node.children),
            })
          )
        ),
      ol: (node) =>
        Effect.succeed(
          emptyProjection(
            OrderedList.make({
              delimiter: "DefaultDelim",
              items: mdListItemPlainBlocks(node.children),
              start: 1,
              style: "DefaultStyle",
            })
          )
        ),
      li: (node) =>
        Effect.map(mdInlinesToPandoc(node.children, path), ({ issues, value }) => ({
          issues,
          value: Plain.make({ children: value }),
        })),
      taskList: (node) =>
        Effect.succeed({
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
            items: mdListItemPlainBlocks(node.children),
          }),
        }),
      hr: () => Effect.succeed(emptyProjection(HorizontalRule.make({}))),
    })
  );

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
