/**
 * @since 0.0.0
 */

import { Effect, Layer, Match, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";

import * as Configuration from "./Configuration.js";
import type * as Domain from "./Domain.js";
import * as Parser from "./Parser.js";

/**
 * Union of documented entities that the markdown printer can render.
 *
 * @internal
 * @category printers
 */
export type Printable =
  | Domain.Class
  | Domain.Constant
  | Domain.Export
  | Domain.Function
  | Domain.Interface
  | Domain.TypeAlias
  | Domain.Namespace;

const Markdown = {
  bold: (content: string) => `**${content}**`,
  strikethrough: (content: string) => `~~${content}~~`,
};

function replaceJSDocLinks(text: string): string {
  return text.replace(/\{@link\s+([^\s}]+)(?:\s+([^}]+))?}/g, (_, link, label) => `\`${Str.trim(label || link)}\``);
}

function removeFenceMetadata(markdown: string): string {
  return markdown.replace(/^(`{3,})([^\n]*)/gm, (_match, fence, info) => {
    const tokens = pipe(info, Str.trim, Str.split(/\s+/));
    return `${fence}${tokens[0] ?? ""}`;
  });
}

const printOptionalDescription = (description: string | undefined) =>
  Effect.gen(function* () {
    if (P.isUndefined(description)) {
      return "";
    }

    const config = yield* Configuration.Configuration;
    const descriptionWithoutLinks = replaceJSDocLinks(description);
    const out =
      config.theme === Configuration.DEFAULT_THEME
        ? removeFenceMetadata(descriptionWithoutLinks)
        : descriptionWithoutLinks;
    return `\n\n${out}`;
  });

const printArray = (title: string, values?: ReadonlyArray<string>): string => {
  if (P.isUndefined(values) || A.isReadonlyArrayEmpty(values)) {
    return "";
  }

  return `\n\n${Markdown.bold(title)}\n\n${A.join("\n")(values)}`;
};

const printFence = (code: string): string => {
  if (
    pipe(
      ["```ts", "~~~ts"],
      A.some((prefix) => Str.startsWith(prefix)(code))
    )
  ) {
    return code;
  }

  return `\`\`\`ts\n${code}\n\`\`\``;
};

const printOptionalSignature = (signature?: string): string =>
  signature === undefined ? "" : `\n\n${Markdown.bold("Signature")}\n\n${printFence(signature)}`;

const printThrowsArray = (throws?: ReadonlyArray<string>) => printArray("Throws", throws);

const printExamplesArray = (examples: ReadonlyArray<string>): string =>
  examples.length === 0
    ? ""
    : pipe(
        examples,
        A.map((example) => `\n\n**Example**\n\n${printFence(example)}`),
        A.join("")
      );

const printOptionalSince = (since: ReadonlyArray<string>): string =>
  since.length === 0 ? "" : `\n\nSince v${A.join(", ")(since)}`;

const printHeaderByIndentation = (indentation: number) =>
  Match.value(indentation).pipe(
    Match.when(0, () => "## "),
    Match.when(1, () => "### "),
    Match.orElse(() => "#### ")
  );

const printTitle = (name: string, deprecated: ReadonlyArray<string>, postfix?: string): string => {
  const printableName = Str.trim(name) === "hasOwnProperty" ? `${name} (function)` : name;
  const title = deprecated.length > 0 ? Markdown.strikethrough(printableName) : printableName;
  return postfix === undefined ? title : `${title} ${postfix}`;
};

const printSeesArray = (sees?: ReadonlyArray<string>): string => {
  if (sees === undefined || sees.length === 0) {
    return "";
  }

  return `\n\n${Markdown.bold("See")}\n\n${pipe(
    sees,
    A.map((see) => `- ${replaceJSDocLinks(see)}`),
    A.join("\n")
  )}`;
};

const printOptionalSourceLink = (position?: Domain.Position) =>
  Effect.gen(function* () {
    if (P.isUndefined(position)) {
      return "";
    }

    const config = yield* Configuration.Configuration;
    const source = yield* Parser.Source;
    const name = source.sourceFile.getBaseName();
    return `\n\n[Source](${config.srcLink}${name}#L${position.line})`;
  });

const printModel = (
  name: string,
  doc: Domain.Doc,
  options: {
    readonly signature?: string | undefined;
    readonly position?: Domain.Position | undefined;
    readonly indentation?: number | undefined;
    readonly postfix?: string | undefined;
  }
) =>
  Effect.gen(function* () {
    const sourceLink = yield* printOptionalSourceLink(options.position);
    const description = yield* printOptionalDescription(doc.description);
    return (
      printHeaderByIndentation(options.indentation ?? 0) +
      printTitle(name, doc.deprecated, options.postfix) +
      description +
      printThrowsArray(doc.throws) +
      printExamplesArray(doc.examples) +
      printSeesArray(doc.sees) +
      printOptionalSignature(options.signature) +
      sourceLink +
      printOptionalSince(doc.since)
    );
  });

const printEntry = (
  model: Domain.DocEntry,
  options: {
    readonly indentation?: number | undefined;
    readonly postfix?: string | undefined;
  }
) =>
  printModel(model.name, model.doc, {
    signature: model.signature,
    position: model.position,
    indentation: options.indentation,
    postfix: options.postfix,
  });

const printStaticMethod = (model: Domain.DocEntry) =>
  printEntry(model, {
    indentation: 1,
    postfix: "(static method)",
  });

const printMethod = (model: Domain.DocEntry) =>
  printEntry(model, {
    indentation: 1,
    postfix: "(method)",
  });

const printProperty = (model: Domain.DocEntry) =>
  printEntry(model, {
    indentation: 1,
    postfix: "(property)",
  });

const printClass = (model: Domain.Class) =>
  Effect.gen(function* () {
    const header = yield* printEntry(model, { postfix: "(class)" });
    const staticMethods = yield* Effect.forEach(model.staticMethods, printStaticMethod);
    const methods = yield* Effect.forEach(model.methods, printMethod);
    const properties = yield* Effect.forEach(model.properties, printProperty);

    return (
      header +
      pipe(
        staticMethods,
        A.map((value) => `\n\n${value}`),
        A.join("")
      ) +
      pipe(
        methods,
        A.map((value) => `\n\n${value}`),
        A.join("")
      ) +
      pipe(
        properties,
        A.map((value) => `\n\n${value}`),
        A.join("")
      )
    );
  });

const printConstant = (model: Domain.Constant) => printEntry(model, {});

const printExport = (model: Domain.Export) =>
  printEntry(model, {
    postfix: model.isNamespaceExport ? "(namespace export)" : undefined,
  });

const printFunction = (model: Domain.Function) => printEntry(model, {});

const printInterface = (model: Domain.Interface, indentation: number) =>
  printEntry(model, {
    indentation,
    postfix: "(interface)",
  });

const printTypeAlias = (model: Domain.TypeAlias, indentation: number) =>
  printEntry(model, {
    indentation,
    postfix: "(type alias)",
  });

const printNamespace = (
  model: Domain.Namespace,
  indentation: number
): Effect.Effect<string, never, Configuration.Configuration | Parser.Source> =>
  Effect.gen(function* () {
    const header = yield* printModel(model.name, model.doc, {
      position: model.position,
      indentation,
      postfix: "(namespace)",
    });
    const interfaces = yield* Effect.forEach(model.interfaces, (inter) => printInterface(inter, indentation + 1));
    const typeAliases = yield* Effect.forEach(model.typeAliases, (typeAlias) =>
      printTypeAlias(typeAlias, indentation + 1)
    );
    const namespaces = yield* Effect.forEach(model.namespaces, (namespace) =>
      printNamespace(namespace, indentation + 1)
    );

    return (
      header +
      pipe(
        interfaces,
        A.map((value) => `\n\n${value}`),
        A.join("")
      ) +
      pipe(
        typeAliases,
        A.map((value) => `\n\n${value}`),
        A.join("")
      ) +
      pipe(
        namespaces,
        A.map((value) => `\n\n${value}`),
        A.join("")
      )
    );
  });

/**
 * Renders a single documented entity into markdown.
 *
 * @internal
 * @param printable - Documented entity to render.
 * @returns Effect that renders markdown for the provided entity.
 * @category printers
 */
export const print = (printable: Printable) =>
  Match.value(printable).pipe(
    Match.tag("Class", printClass),
    Match.tag("Constant", printConstant),
    Match.tag("Export", printExport),
    Match.tag("Function", printFunction),
    Match.tag("Interface", (value) => printInterface(value, 0)),
    Match.tag("TypeAlias", (value) => printTypeAlias(value, 0)),
    Match.tag("Namespace", (value) => printNamespace(value, 0)),
    Match.exhaustive
  );

const DEFAULT_CATEGORY = "utils";

const byCategory = Order.mapInput(Str.Order, ([category]: [string, ...Array<unknown>]) => category);

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

const sortByName: <A extends { name: string }>(self: Iterable<A>) => Array<A> = A.sort(
  Order.mapInput(Str.Order, ({ name }: { readonly name: string }) => name)
);

/**
 * Renders a parsed module into markdown grouped by documentation category.
 *
 * @param module - Module to render.
 * @returns Effect that renders markdown for the provided module.
 * @category printers
 * @since 0.0.0
 */
export const printModule = (module: Domain.Module) =>
  Effect.scoped(
    Layer.build(Parser.Source.layer(module.source)).pipe(
      Effect.flatMap((context) =>
        Effect.gen(function* () {
          const description = yield* printModel(module.name, module.doc, { postfix: "overview" });

          const grouped = A.groupBy(sortByName(getPrintables(module)), (printable) =>
            printable.doc.category.length === 0 ? DEFAULT_CATEGORY : A.join(", ")(printable.doc.category)
          );
          const printables = A.sort(byCategory)(R.toEntries(grouped) as Array<[string, Array<Printable>]>);

          const strings = yield* Effect.forEach(printables, ([category, categoryPrintables]) =>
            Effect.gen(function* () {
              const values = yield* Effect.forEach(sortByName(categoryPrintables), print);
              return `\n\n# ${category}${pipe(
                values,
                A.map((value) => `\n\n${value}`),
                A.join("")
              )}`;
            })
          );

          return `${description}

<!-- toc -->${A.join("")(strings)}`;
        }).pipe(Effect.provide(context))
      )
    )
  );

/**
 * Builds the front matter used for a generated module documentation page.
 *
 * @param module - Module whose page metadata is being rendered.
 * @param navOrder - Navigation order to assign in the generated site.
 * @returns Front matter block for the module page.
 * @category printers
 * @since 0.0.0
 */
export const printFrontMatter = (module: Domain.Module, navOrder: number): string => `---
title: ${module.name}
nav_order: ${navOrder}
parent: Modules
---`;

/**
 * `prettier` is optional in this repo-local port; returning the markdown
 * unchanged keeps the generation deterministic while avoiding another runtime
 * dependency during the migration.
 *
 * @param content - Markdown content to normalize before writing.
 * @returns Effect that currently returns the markdown unchanged.
 * @category printers
 * @since 0.0.0
 */
export function prettify(content: string) {
  return Effect.succeed(content);
}
