"use client";

import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { $isCodeNode } from "@lexical/code";
import * as Effect from "effect/Effect";
import { $getNearestNodeFromDOMNode, type LexicalEditor } from "lexical";
import type { Options } from "prettier";
import { useCallback, useState } from "react";
import { PrettierError, UnsupportedLanguageError } from "../../../../schema/errors";

interface Props {
  readonly lang: string;
  readonly editor: LexicalEditor;
  readonly getCodeDOMNode: () => HTMLElement | null;
}

const PRETTIER_PARSER_MODULES = {
  css: [() => import("prettier/parser-postcss")],
  html: [() => import("prettier/parser-html")],
  js: [() => import("prettier/parser-babel"), () => import("prettier/plugins/estree")],
  markdown: [() => import("prettier/parser-markdown")],
  typescript: [() => import("prettier/parser-typescript"), () => import("prettier/plugins/estree")],
} as const;

type LanguagesType = keyof typeof PRETTIER_PARSER_MODULES;

const loadPrettierParserByLang = Effect.fn("loadPrettierParserByLang")(function* (lang: string) {
  const dynamicImports = PRETTIER_PARSER_MODULES[lang as LanguagesType];
  return yield* Effect.tryPromise({
    try: () => Promise.all(dynamicImports.map((dynamicImport) => dynamicImport())),
    catch: (cause) =>
      new PrettierError({
        message: `Failed to load Prettier parser for ${lang}`,
        cause,
      }),
  });
});

const loadPrettierFormat = Effect.fn("loadPrettierFormat")(function* () {
  return yield* Effect.tryPromise({
    try: async () => {
      const { format } = await import("prettier/standalone");
      return format;
    },
    catch: (cause) =>
      new PrettierError({
        message: "Failed to load Prettier format function",
        cause,
      }),
  });
});

const PRETTIER_OPTIONS_BY_LANG: Record<string, Options> = {
  css: { parser: "css" },
  html: { parser: "html" },
  js: { parser: "babel" },
  markdown: { parser: "markdown" },
  typescript: { parser: "typescript" },
};

const LANG_CAN_BE_PRETTIER = Object.keys(PRETTIER_OPTIONS_BY_LANG);

export function canBePrettier(lang: string): boolean {
  return LANG_CAN_BE_PRETTIER.includes(lang);
}

const getPrettierOptions = Effect.fn("getPrettierOptions")(function* (lang: string) {
  const options = PRETTIER_OPTIONS_BY_LANG[lang];
  if (!options) {
    return yield* Effect.fail(
      new UnsupportedLanguageError({
        message: `Prettier does not support this language: ${lang}`,
        lang,
      })
    );
  }
  return options;
});

const formatWithPrettier = Effect.fn("formatWithPrettier")(function* (content: string, lang: string) {
  const format = yield* loadPrettierFormat();
  const options = yield* getPrettierOptions(lang);
  const prettierParsers = yield* loadPrettierParserByLang(lang);
  const optionsWithPlugins = {
    ...options,
    plugins: prettierParsers.map((parser) => parser.default || parser),
  };

  return yield* Effect.tryPromise({
    try: () => format(content, optionsWithPlugins),
    catch: (cause) =>
      new PrettierError({
        message: "Prettier formatting failed",
        cause,
      }),
  });
});

export function PrettierButton({ lang, editor, getCodeDOMNode }: Props) {
  const [syntaxError, setSyntaxError] = useState<string>("");
  const [tipsVisible, setTipsVisible] = useState<boolean>(false);
  const runtime = useRuntime();
  const runPromise = makeRunClientPromise(runtime);

  const handleClick = useCallback(async (): Promise<void> => {
    const codeDOMNode = getCodeDOMNode();
    if (!codeDOMNode) {
      return;
    }

    let content = "";
    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }
    });
    if (content === "") {
      return;
    }

    await runPromise(
      formatWithPrettier(content, lang).pipe(
        Effect.tap((formattedCode) =>
          Effect.sync(() => {
            editor.update(() => {
              const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
              if ($isCodeNode(codeNode)) {
                const selection = codeNode.select(0);
                selection.insertText(formattedCode);
                setSyntaxError("");
                setTipsVisible(false);
              }
            });
          })
        ),
        Effect.catchAll((error) =>
          Effect.sync(() => {
            setSyntaxError(error.message);
            setTipsVisible(true);
          })
        )
      )
    );
  }, [editor, getCodeDOMNode, lang, runPromise]);

  function handleMouseEnter() {
    if (syntaxError !== "") {
      setTipsVisible(true);
    }
  }

  function handleMouseLeave() {
    if (syntaxError !== "") {
      setTipsVisible(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="border border-transparent rounded p-1 bg-transparent cursor-pointer shrink-0 flex items-center text-foreground/50 uppercase hover:border-foreground/30 hover:opacity-90 active:bg-accent/30 active:border-foreground/45"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="prettier"
      >
        {syntaxError ? (
          <i className="format prettier-error h-4 w-4 opacity-60 flex text-foreground/50 bg-contain" />
        ) : (
          <i className="format prettier h-4 w-4 opacity-60 flex text-foreground/50 bg-contain" />
        )}
      </button>
      {tipsVisible ? (
        <pre className="p-1.5 rounded text-white bg-zinc-800 mt-1 absolute top-[26px] right-0">{syntaxError}</pre>
      ) : null}
    </div>
  );
}
