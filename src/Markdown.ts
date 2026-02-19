/**
 * @since 1.0.0
 */
import * as Array from "effect/Array"
import * as Effect from "effect/Effect"
import { identity, pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Order from "effect/Order"
import * as Record from "effect/Record"
import * as String from "effect/String"
import * as Prettier from "prettier"
import type * as Domain from "./Domain.js"

type Printable =
  | Domain.Class
  | Domain.Constant
  | Domain.Export
  | Domain.Function
  | Domain.Interface
  | Domain.TypeAlias
  | Domain.Namespace

const createHeaderPrinter = (level: number) => (content: string): string =>
  "#".repeat(level) + " " + content + "\n\n"

const MarkdownPrinter = {
  bold: (s: string) => `**${s}**`,
  fence: (start: string, content: string, end: string) =>
    start + "\n" + content + "\n" + end + "\n\n",
  paragraph: (...content: ReadonlyArray<string>) => "\n" + content.join("") + "\n\n",
  strikethrough: (content: string) => `~~${content}~~`,
  h1: createHeaderPrinter(1),
  h2: createHeaderPrinter(2),
  h3: createHeaderPrinter(3),
  h4: createHeaderPrinter(4)
}

const printSince: (v: Option.Option<string>) => string = Option.match({
  onNone: () => "",
  onSome: (v) => MarkdownPrinter.paragraph(`Added in v${v}`)
})

const printTitle = (s: string, deprecated: boolean, type?: string): string => {
  const name = s.trim() === "hasOwnProperty" ? `${s} (function)` : s
  const title = deprecated ? MarkdownPrinter.strikethrough(name) : name
  return Option.fromNullable(type).pipe(
    Option.match({
      onNone: () => title,
      onSome: (t) => title + ` ${t}`
    })
  )
}

const printDescription = (d: Option.Option<string>): string =>
  MarkdownPrinter.paragraph(Option.getOrElse(d, () => ""))

const printSignature = (s: string): string =>
  MarkdownPrinter.paragraph(MarkdownPrinter.bold("Signature")) +
  MarkdownPrinter.paragraph(MarkdownPrinter.fence("```ts", s, "```"))

const printSignatures = (ss: ReadonlyArray<string>): string =>
  MarkdownPrinter.paragraph(MarkdownPrinter.bold("Signature")) +
  MarkdownPrinter.paragraph(MarkdownPrinter.fence("```ts", ss.join("\n"), "```"))

const printExamples = (es: ReadonlyArray<Domain.Example>): string =>
  es
    .map(({ body, fences }) =>
      MarkdownPrinter.paragraph(MarkdownPrinter.bold("Example")) +
      MarkdownPrinter.paragraph(
        MarkdownPrinter.fence(fences?.start ?? "```ts", body, fences?.end ?? "```")
      )
    )
    .join("\n\n")

const printStaticMethod = (m: Domain.Method): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h3(printTitle(m.name, m.deprecated, "(static method)")),
    printDescription(m.description),
    printSignatures(m.signatures),
    printExamples(m.examples),
    printSince(m.since)
  )

const printMethod = (m: Domain.Method): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h3(printTitle(m.name, m.deprecated, "(method)")),
    printDescription(m.description),
    printSignatures(m.signatures),
    printExamples(m.examples),
    printSince(m.since)
  )

const printProperty = (p: Domain.Property): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h3(printTitle(p.name, p.deprecated, "(property)")),
    printDescription(p.description),
    printSignature(p.signature),
    printExamples(p.examples),
    printSince(p.since)
  )

const printStaticMethods = (methods: ReadonlyArray<Domain.Method>): string =>
  Array.map(methods, (method) => printStaticMethod(method) + "\n\n").join("")

const printMethods = (methods: ReadonlyArray<Domain.Method>): string =>
  Array.map(methods, (method) => printMethod(method) + "\n\n").join("")

const printProperties = (properties: ReadonlyArray<Domain.Property>): string =>
  Array.map(
    properties,
    (property) => printProperty(property) + "\n\n"
  ).join("")

const printModuleDescription = (module: Domain.Module): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h2(printTitle(module.name, module.deprecated, "overview")),
    printDescription(module.description),
    printExamples(module.examples),
    printSince(module.since)
  )

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
  )

/** @internal */
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
  )

/** @internal */
export const printConstant = (model: Domain.Constant): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h2(printTitle(model.name, model.deprecated)),
    printDescription(model.description),
    printSignature(model.signature),
    printExamples(model.examples),
    printSince(model.since)
  )

/** @internal */
export const printExport = (model: Domain.Export): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h2(printTitle(model.name, model.deprecated)),
    printDescription(model.description),
    printSignature(model.signature),
    printExamples(model.examples),
    printSince(model.since)
  )

/** @internal */
export const printFunction = (model: Domain.Function): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.h2(printTitle(model.name, model.deprecated)),
    printDescription(model.description),
    printSignatures(model.signatures),
    printExamples(model.examples),
    printSince(model.since)
  )

/** @internal */
export const printInterface = (model: Domain.Interface, indentation: number): string =>
  MarkdownPrinter.paragraph(
    getHeaderByIndentation(indentation)(printTitle(model.name, model.deprecated, "(interface)")),
    printDescription(model.description),
    printSignature(model.signature),
    printExamples(model.examples),
    printSince(model.since)
  )

/** @internal */
export const printTypeAlias = (model: Domain.TypeAlias, indentation: number): string =>
  MarkdownPrinter.paragraph(
    getHeaderByIndentation(indentation)(printTitle(model.name, model.deprecated, "(type alias)")),
    printDescription(model.description),
    printSignature(model.signature),
    printExamples(model.examples),
    printSince(model.since)
  )

const getHeaderByIndentation = (indentation: number) => {
  switch (indentation) {
    case 0:
      return MarkdownPrinter.h2
    case 1:
      return MarkdownPrinter.h3
    default:
      return MarkdownPrinter.h4
  }
}

/** @internal */
export const printNamespace = (ns: Domain.Namespace, indentation: number): string =>
  MarkdownPrinter.paragraph(
    MarkdownPrinter.paragraph(
      getHeaderByIndentation(indentation)(printTitle(ns.name, ns.deprecated, "(namespace)")),
      printDescription(ns.description),
      printExamples(ns.examples),
      printSince(ns.since)
    ),
    Array.map(ns.interfaces, (i) => printInterface(i, indentation + 1) + "\n\n").join(""),
    Array.map(
      ns.typeAliases,
      (typeAlias) => printTypeAlias(typeAlias, indentation + 1) + "\n\n"
    ).join(""),
    Array.map(
      ns.namespaces,
      (namespace) => printNamespace(namespace, indentation + 1) + "\n\n"
    ).join("")
  )

/** @internal */
export const print = (p: Printable): string => {
  switch (p._tag) {
    case "Class":
      return printClass(p)
    case "Constant":
      return printConstant(p)
    case "Export":
      return printExport(p)
    case "Function":
      return printFunction(p)
    case "Interface":
      return printInterface(p, 0)
    case "TypeAlias":
      return printTypeAlias(p, 0)
    case "Namespace":
      return printNamespace(p, 0)
  }
}

const getPrintables = (module: Domain.Module): ReadonlyArray<Printable> =>
  Array.flatten([
    module.classes,
    module.constants,
    module.exports,
    module.functions,
    module.interfaces,
    module.typeAliases,
    module.namespaces
  ])

const DEFAULT_CATEGORY = "utils"

const byCategory = Order.mapInput(
  String.Order,
  ([category]: [string, ...Array<unknown>]) => category
)

/**
 * @example
 * import * as Markdown from "@effect/docgen/Markdown"
 * import * as Domain from "@effect/docgen/Domain"
 * import { Option } from "effect"
 *
 * const doc = Domain.createNamedDoc("tests", Option.none(), Option.some("1.0.0"), false, [], Option.none())
 * const m = Domain.createModule(doc, ["src", "tests.ts"], [], [], [], [], [], [], [])
 * console.log(Markdown.printModule(m, 0))
 *
 * @category printers
 * @since 1.0.0
 */
export const printModule = (
  module: Domain.Module,
  order: number
): Effect.Effect<string> =>
  Effect.gen(function*(_) {
    const header = printMeta(module.path.slice(1).join("/"), order)

    const description = MarkdownPrinter.paragraph(printModuleDescription(module))

    const content = pipe(
      getPrintables(module),
      Array.groupBy(({ category }) => Option.getOrElse(category, () => DEFAULT_CATEGORY)),
      Record.toEntries,
      Array.sort(byCategory),
      Array.map(([category, printables]) =>
        [
          MarkdownPrinter.h1(category),
          ...pipe(
            printables,
            Array.sort(
              Order.mapInput(
                String.Order,
                (printable: Printable) => printable.name
              )
            ),
            Array.map(print)
          )
        ].join("\n")
      )
    ).join("\n")

    const toc = yield* _(
      Effect.tryPromise({
        try: () => {
          // @ts-ignore
          return import("@effect/markdown-toc").then((m) => m.default)
        },
        catch: identity
      }).pipe(Effect.orDie)
    )

    const tableOfContents = (content: string) =>
      "<h2 class=\"text-delta\">Table of contents</h2>\n\n"
      + toc(content).content
      + "\n\n"

    return yield* _(prettify(
      [
        header,
        description,
        "---\n",
        tableOfContents(content),
        "---\n",
        content
      ].join("\n")
    ))
  })

const defaultPrettierOptions: Prettier.Options = {
  parser: "markdown",
  semi: false,
  singleQuote: false,
  printWidth: 120,
  trailingComma: "none"
}

/** @internal */
export const prettify = (s: string): Effect.Effect<string> =>
  Effect.tryPromise({
    try: () => Prettier.format(s, defaultPrettierOptions),
    catch: identity
  }).pipe(Effect.orDie)
