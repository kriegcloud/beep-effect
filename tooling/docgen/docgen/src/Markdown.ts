/**
 * @module @beep/repo-cli/commands/DocgenV2/Markdown
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TSCategoryTag } from "@beep/repo-utils/JSDoc/models/index";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import Prettier from "prettier";
import * as Domain from "./Domain.ts";

const $I = $RepoCliId.create("commands/DocgenV2/Markdown");

class DocgenMarkdownError extends TaggedErrorClass<DocgenMarkdownError>($I`DocgenMarkdownError`)(
  "DocgenMarkdownError",
  {
    operation: S.String,
    message: S.String,
    cause: S.Unknown,
  },
  $I.annote("DocgenMarkdownError", {
    description: "Raised when DocgenV2 markdown rendering fails during dynamic toc loading or prettier formatting.",
  })
) {}

/**
 * Schema for the domain nodes that can be rendered as markdown sections.
 *
 * @category Schemas
 * @since 0.0.0
 */
export const Printable = S.Union([
  Domain.Class,
  Domain.Constant,
  Domain.Export,
  Domain.Function,
  Domain.Interface,
  Domain.TypeAlias,
  Domain.Namespace,
]).pipe(
  $I.annoteSchema("Printable", {
    description: "Schema for the domain nodes that can be rendered as markdown sections.",
  })
);

/**
 * Runtime type for the domain nodes that can be rendered as markdown sections.
 *
 * @category Types
 * @since 0.0.0
 */
export type Printable = typeof Printable.Type;

const createHeaderPrinter =
  (level: number) =>
  (content: string): string =>
    `${"#".repeat(level)} ${content}

`;

const MarkdownPrinter = {
  bold: (s: string) => `**${s}**`,
  fence: (start: string, content: string, end: string) =>
    `${start}
${content}
${end}

`,
  paragraph: (...content: ReadonlyArray<string>) => `
${content.join("")}

`,
  strikethrough: (content: string) => `~~${content}~~`,
  h1: createHeaderPrinter(1),
  h2: createHeaderPrinter(2),
  h3: createHeaderPrinter(3),
  h4: createHeaderPrinter(4),
};

const printSince: (v: O.Option<string>) => string = O.match({
  onNone: () => "",
  onSome: (v) => MarkdownPrinter.paragraph(`Added in v${v}`),
});

const printTitle = (s: string, deprecated: boolean, type?: string): string => {
  const name = s.trim() === "hasOwnProperty" ? `${s} (function)` : s;
  const title = deprecated ? MarkdownPrinter.strikethrough(name) : name;
  return O.fromNullishOr(type).pipe(
    O.match({
      onNone: () => title,
      onSome: (t) => `${title} ${t}`,
    })
  );
};

const printDescription = (d: O.Option<string>): string => MarkdownPrinter.paragraph(O.getOrElse(d, () => ""));

const printSignature = (s: string): string =>
  MarkdownPrinter.paragraph(MarkdownPrinter.bold("Signature")) +
  MarkdownPrinter.paragraph(MarkdownPrinter.fence("```ts", s, "```"));

const printSignatures = (ss: ReadonlyArray<string>): string =>
  MarkdownPrinter.paragraph(MarkdownPrinter.bold("Signature")) +
  MarkdownPrinter.paragraph(MarkdownPrinter.fence("```ts", ss.join("\n"), "```"));

const printExamples = (es: ReadonlyArray<Domain.Example>): string =>
  es
    .map(
      ({ body, fences }) =>
        MarkdownPrinter.paragraph(MarkdownPrinter.bold("Example")) +
        fences.pipe(
          O.match({
            onNone: () => MarkdownPrinter.fence("```ts", body, "```"),
            onSome: ({ start, end }) => MarkdownPrinter.fence(start, body, end),
          })
        )
    )
    .join("\n\n");

const printStaticMethod = (m: Domain.Method): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h3(printTitle(m.name, m.deprecated, "(static method)")),
    printDescription(m.description),
    printSignatures(m.signatures),
    printExamples(m.examples),
    printSince(m.since)
  );

const printMethod = (m: Domain.Method): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h3(printTitle(m.name, m.deprecated, "(method)")),
    printDescription(m.description),
    printSignatures(m.signatures),
    printExamples(m.examples),
    printSince(m.since)
  );

const printProperty = (p: Domain.Property): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h3(printTitle(p.name, p.deprecated, "(property)")),
    printDescription(p.description),
    printSignature(p.signature),
    printExamples(p.examples),
    printSince(p.since)
  );

const printStaticMethods = (methods: ReadonlyArray<Domain.Method>): string =>
  A.map(
    methods,
    (method) => `${printStaticMethod(method)}

`
  ).join("");

const printMethods = (methods: ReadonlyArray<Domain.Method>): string =>
  A.map(
    methods,
    (method) => `${printMethod(method)}

`
  ).join("");

const printProperties = (properties: ReadonlyArray<Domain.Property>): string =>
  A.map(
    properties,
    (property) => `${printProperty(property)}

`
  ).join("");

const printModuleDescription = (module: Domain.Module): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h2(printTitle(module.name, module.deprecated, "overview")),
    printDescription(module.description),
    printExamples(module.examples),
    printSince(module.since)
  );

const printMeta = (title: string, order: number): string =>
  MarkdownPrinter.paragraph(
    "---",
    `\n`,
    `title: ${title}`,
    `\n`,
    `nav_order: ${order}`,
    `\n`,
    `parent: Modules`,
    `\n`,
    "---"
  );

/**
 * Renders a documented class section.
 *
 * @internal
 * @param model The class model to render.
 * @returns Markdown for the class section.
 * @category Printers
 * @since 1.0.0
 */
export const printClass = (model: Domain.Class): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.paragraph(
      MarkdownPrinter.h2(printTitle(model.name, model.deprecated, "(class)")),
      printDescription(model.description),
      printSignature(model.signature),
      printExamples(model.examples),
      printSince(model.since)
    ),
    printStaticMethods(model.staticMethods),
    printMethods(model.methods),
    printProperties(model.properties)
  );

/**
 * Renders a documented constant section.
 *
 * @internal
 * @param model The constant model to render.
 * @returns Markdown for the constant section.
 * @category Printers
 * @since 1.0.0
 */
export const printConstant = (model: Domain.Constant): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h2(printTitle(model.name, model.deprecated)),
    printDescription(model.description),
    printSignature(model.signature),
    printExamples(model.examples),
    printSince(model.since)
  );

/**
 * Renders a documented re-export section.
 *
 * @internal
 * @param model The re-export model to render.
 * @returns Markdown for the re-export section.
 * @category Printers
 * @since 1.0.0
 */
export const printExport = (model: Domain.Export): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h2(printTitle(model.name, model.deprecated)),
    printDescription(model.description),
    printSignature(model.signature),
    printExamples(model.examples),
    printSince(model.since)
  );

/**
 * Renders a documented function section.
 *
 * @internal
 * @param model The function model to render.
 * @returns Markdown for the function section.
 * @category Printers
 * @since 1.0.0
 */
export const printFunction = (model: Domain.Function): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h2(printTitle(model.name, model.deprecated)),
    printDescription(model.description),
    printSignatures(model.signatures),
    printExamples(model.examples),
    printSince(model.since)
  );

/**
 * Renders a documented interface section.
 *
 * @internal
 * @param model The interface model to render.
 * @param indentation The current heading indentation level.
 * @returns Markdown for the interface section.
 * @category Printers
 * @since 1.0.0
 */
export const printInterface = (model: Domain.Interface, indentation: number): string =>
  MarkdownPrinter.paragraph(
    getHeaderByIndentation(indentation)(printTitle(model.name, model.deprecated, "(interface)")),
    printDescription(model.description),
    printSignature(model.signature),
    printExamples(model.examples),
    printSince(model.since)
  );

/**
 * Renders a documented type alias section.
 *
 * @internal
 * @param model The type alias model to render.
 * @param indentation The current heading indentation level.
 * @returns Markdown for the type alias section.
 * @category Printers
 * @since 1.0.0
 */
export const printTypeAlias = (model: Domain.TypeAlias, indentation: number): string =>
  MarkdownPrinter.paragraph(
    getHeaderByIndentation(indentation)(printTitle(model.name, model.deprecated, "(type alias)")),
    printDescription(model.description),
    printSignature(model.signature),
    printExamples(model.examples),
    printSince(model.since)
  );

const getHeaderByIndentation = (indentation: number) => {
  switch (indentation) {
    case 0:
      return MarkdownPrinter.h2;
    case 1:
      return MarkdownPrinter.h3;
    default:
      return MarkdownPrinter.h4;
  }
};

/**
 * Renders a documented namespace section and its nested members.
 *
 * @internal
 * @param ns The namespace model to render.
 * @param indentation The current heading indentation level.
 * @returns Markdown for the namespace section.
 * @category Printers
 * @since 1.0.0
 */
export const printNamespace = (ns: Domain.Namespace, indentation: number): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.paragraph(
      getHeaderByIndentation(indentation)(printTitle(ns.name, ns.deprecated, "(namespace)")),
      printDescription(ns.description),
      printExamples(ns.examples),
      printSince(ns.since)
    ),
    A.map(
      ns.interfaces,
      (i) => `${printInterface(i, indentation + 1)}

`
    ).join(""),
    A.map(
      ns.typeAliases,
      (typeAlias) => `${printTypeAlias(typeAlias, indentation + 1)}

`
    ).join(""),
    A.map(
      ns.namespaces,
      (namespace) => `${printNamespace(namespace, indentation + 1)}

`
    ).join("")
  );

/**
 * Renders a printable domain node into markdown.
 *
 * @internal
 * @param p The printable value to render.
 * @returns Markdown for the provided domain node.
 * @category Printers
 * @since 1.0.0
 */
export const print = (p: Printable): string => {
  switch (p._tag) {
    case "Class":
      return printClass(p);
    case "Constant":
      return printConstant(p);
    case "Export":
      return printExport(p);
    case "Function":
      return printFunction(p);
    case "Interface":
      return printInterface(p, 0);
    case "TypeAlias":
      return printTypeAlias(p, 0);
    case "Namespace":
      return printNamespace(p, 0);
  }
};

const getPrintables = (module: Domain.Module): ReadonlyArray<Printable> =>
  A.flatten([
    module.classes,
    module.constants,
    module.exports,
    module.functions,
    module.interfaces,
    module.typeAliases,
    module.namespaces,
  ]);

const DEFAULT_CATEGORY = TSCategoryTag.Enum.Uncategorized;

type CategoryEntry = readonly [string, ReadonlyArray<Printable>];

const byCategory: Order.Order<CategoryEntry> = Order.mapInput(Str.Order, ([category]: CategoryEntry) => category);

const getPrintableCategory = ({ category }: Printable): string => O.getOrElse(category, () => DEFAULT_CATEGORY);

const toCategoryEntry = (category: string, printables: ReadonlyArray<Printable>): CategoryEntry => [
  category,
  printables,
];

const byPrintableName: Order.Order<Printable> = Order.mapInput(Str.Order, (printable: Printable) => printable.name);

const toMarkdownError =
  (operation: string, message: string) =>
  (cause: unknown): DocgenMarkdownError =>
    new DocgenMarkdownError({
      operation,
      message,
      cause,
    });

/**
 * Renders a full module page, including metadata, table of contents, and grouped export sections.
 *
 * @param module The parsed module model to render.
 * @param order The navigation order for the generated page.
 * @returns An effect that yields formatted markdown for the module page.
 * @example
 * import * as Markdown from "@effect/docgen/Markdown"
 * import * as Domain from "@effect/docgen/Domain"
 * import { Option } from "effect"
 * const doc = Domain.createNamedDoc("tests", O.none(), O.some("1.0.0"), false, [], O.none())
 * const m = Domain.createModule(doc, ["src", "tests.ts"], [], [], [], [], [], [], [])
 * console.log(Markdown.printModule(m, 0))
 * @category printers
 * @since 1.0.0
 */
export const printModule = (module: Domain.Module, order: number) =>
  Effect.gen(function* () {
    const header = printMeta(module.path.slice(1).join("/"), order);

    const description = MarkdownPrinter.paragraph(printModuleDescription(module));

    const content = pipe(
      getPrintables(module),
      A.groupBy(getPrintableCategory),
      R.collect(toCategoryEntry),
      A.sort(byCategory),
      A.map(([category, printables]) =>
        [MarkdownPrinter.h1(category), ...pipe(printables, A.sort(byPrintableName), A.map(print))].join("\n")
      )
    ).join("\n");

    const toc = yield* Effect.tryPromise({
      try: () => {
        // @ts-expect-error - not typed.
        return import("@effect/markdown-toc").then((m) => m.default);
      },
      catch: toMarkdownError("loadMarkdownToc", "Failed to load @effect/markdown-toc"),
    }).pipe(Effect.orDie);

    const tableOfContents = (content: string) =>
      `<h2 class="text-delta">Table of contents</h2>

${toc(content).content}

`;

    return yield* prettify([header, description, "---\n", tableOfContents(content), "---\n", content].join("\n"));
  });

const defaultPrettierOptions: Prettier.Options = {
  parser: "markdown",
  semi: false,
  singleQuote: false,
  printWidth: 120,
  trailingComma: "none",
};

/**
 * Formats generated markdown with Prettier before it is written to disk.
 *
 * @internal
 * @param s The markdown string to format.
 * @returns An effect that yields formatted markdown.
 * @category Printers
 * @since 1.0.0
 */
export const prettify = (s: string) =>
  Effect.tryPromise({
    try: () => Prettier.format(s, defaultPrettierOptions),
    catch: toMarkdownError("prettifyMarkdown", "Failed to format generated markdown"),
  }).pipe(Effect.orDie);
