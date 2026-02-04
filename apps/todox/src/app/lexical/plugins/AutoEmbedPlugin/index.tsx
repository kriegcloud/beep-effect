"use client";

import { $TodoxId } from "@beep/identity/packages";
import { Button } from "@beep/ui/components/button";
import { Input } from "@beep/ui/components/input";
import { thunkNull } from "@beep/utils";
import {
  AutoEmbedOption,
  type EmbedConfig,
  type EmbedMatchResult,
  LexicalAutoEmbedPlugin,
  URL_MATCHER,
} from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FigmaLogoIcon, XLogoIcon, YoutubeLogoIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { LexicalEditor } from "lexical";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import useModal from "../../hooks/useModal";
import { INSERT_FIGMA_COMMAND } from "../FigmaPlugin";
import { INSERT_TWEET_COMMAND } from "../TwitterPlugin";
import { INSERT_YOUTUBE_COMMAND } from "../YouTubePlugin";

const $I = $TodoxId.create("app/lexical/plugins/AutoEmbedPlugin");

/**
 * Error that occurs when URL parsing fails
 */
class UrlParseError extends S.TaggedError<UrlParseError>($I`UrlParseError`)(
  "UrlParseError",
  {
    url: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("UrlParseError", {
    description: "An error which occurred while parsing an embed URL",
  })
) {}

/**
 * Effect-based URL parsing that wraps both sync and async parseUrl implementations.
 * The parseUrl function can return either a Promise or a direct result, so we handle both cases.
 */
const parseUrlEffect = (config: EmbedConfig, url: string): Effect.Effect<EmbedMatchResult | null, UrlParseError> =>
  F.pipe(
    Effect.try({
      try: () => config.parseUrl(url),
      catch: (error) => new UrlParseError({ url, cause: error }),
    }),
    Effect.flatMap((result) =>
      result instanceof Promise
        ? Effect.tryPromise({
            try: () => result,
            catch: (error) => new UrlParseError({ url, cause: error }),
          })
        : Effect.succeed(result)
    ),
    Effect.catchAll((error) =>
      error instanceof UrlParseError ? Effect.fail(error) : Effect.fail(new UrlParseError({ url, cause: error }))
    )
  );

interface PlaygroundEmbedConfig extends EmbedConfig {
  // Human readable name of the embedded content e.g. Tweet or Google Map.
  readonly contentName: string;

  // Icon for display.
  readonly icon?: undefined | JSX.Element;

  // An example of a matching url https://twitter.com/jack/status/20
  readonly exampleUrl: string;

  // For extra searching.
  readonly keywords: Array<string>;

  // Embed a Figma Project.
  readonly description?: undefined | string;
}

export const YoutubeEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Youtube Video",

  exampleUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",

  // Icon for display.
  icon: <YoutubeLogoIcon className="size-4" />,

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id);
  },

  keywords: ["youtube", "video"],
  // Str.length
  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match = Str.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)(url);

    return match.pipe(
      O.flatMap(([_, id]) => O.fromNullable(id)),
      O.flatMap((id) => (Eq.equals(11)(Str.length(id)) ? O.some(id) : O.none())),
      O.match({
        onNone: thunkNull,
        onSome: (id) => ({ id, url }),
      })
    );
  },

  type: "youtube-video",
};

export const TwitterEmbedConfig: PlaygroundEmbedConfig = {
  // e.g. Tweet or Google Map.
  contentName: "X(Tweet)",

  exampleUrl: "https://x.com/jack/status/20",

  // Icon for display.
  icon: <XLogoIcon className="size-4" />,

  // Create the Lexical embed node from the url data.
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id);
  },

  // For extra searching.
  keywords: ["tweet", "twitter", "x"],

  // Determine if a given URL is a match and return url data.
  parseUrl: (text: string) => {
    const match = Str.match(/^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/)(text);

    return match.pipe(
      O.flatMap((match) =>
        O.all({
          id: A.get(5)(match),
          url: A.get(1)(match),
        })
      ),
      O.getOrNull
    );
  },

  type: "tweet",
};

export const FigmaEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Figma Document",

  exampleUrl: "https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File",

  icon: <FigmaLogoIcon className="size-4" />,

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_FIGMA_COMMAND, result.id);
  },

  keywords: ["figma", "figma.com", "mock-up"],

  // Determine if a given URL is a match and return url data.
  parseUrl: (text: string) => {
    const match = Str.match(/https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/)(text);
    return match.pipe(
      O.flatMap((match) =>
        O.all({
          id: A.get(3)(match),
          url: A.get(0)(match),
        })
      ),
      O.getOrNull
    );
  },

  type: "figma",
};

export const EmbedConfigs = [TwitterEmbedConfig, YoutubeEmbedConfig, FigmaEmbedConfig];

function AutoEmbedMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: AutoEmbedOption;
}) {
  let className = "item";
  if (isSelected) {
    className += " selected";
  }
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-selected valid in listbox context
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      aria-selected={isSelected}
      id={`typeahead-item-${index}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className="text">{option.title}</span>
    </li>
  );
}

function AutoEmbedMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter,
}: {
  readonly selectedItemIndex: number | null;
  readonly onOptionClick: (option: AutoEmbedOption, index: number) => void;
  readonly onOptionMouseEnter: (index: number) => void;
  readonly options: Array<AutoEmbedOption>;
}) {
  return (
    <div className="typeahead-popover">
      <ul>
        {options.map((option: AutoEmbedOption, i: number) => (
          <AutoEmbedMenuItem
            index={i}
            isSelected={selectedItemIndex === i}
            onClick={() => onOptionClick(option, i)}
            onMouseEnter={() => onOptionMouseEnter(i)}
            key={option.key}
            option={option}
          />
        ))}
      </ul>
    </div>
  );
}

const debounce = (callback: (text: string) => void, delay: number) => {
  let timeoutId: number;
  return (text: string) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(text);
    }, delay);
  };
};

export function AutoEmbedDialog({
  embedConfig,
  onClose,
}: {
  embedConfig: PlaygroundEmbedConfig;
  onClose: () => void;
}): JSX.Element {
  const [text, setText] = useState("");
  const [editor] = useLexicalComposerContext();
  const [embedResult, setEmbedResult] = useState<EmbedMatchResult | null>(null);

  const validateText = useMemo(
    () =>
      debounce((inputText: string) => {
        const urlMatch = Str.match(URL_MATCHER)(inputText);
        if (embedConfig != null && inputText != null && O.isSome(urlMatch)) {
          F.pipe(
            parseUrlEffect(embedConfig, inputText),
            Effect.match({
              onFailure: () => setEmbedResult(null),
              onSuccess: (parseResult) => setEmbedResult(parseResult),
            }),
            Effect.runPromise
          );
        } else if (embedResult != null) {
          setEmbedResult(null);
        }
      }, 200),
    [embedConfig, embedResult]
  );

  const onClick = () => {
    if (embedResult != null) {
      embedConfig.insertNode(editor, embedResult);
      onClose();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <label htmlFor="embed-url" className="text-sm font-medium text-foreground">
          URL
        </label>
        <Input
          id="embed-url"
          type="text"
          placeholder={embedConfig.exampleUrl}
          value={text}
          data-test-id={`${embedConfig.type}-embed-modal-url`}
          onChange={(e) => {
            const { value } = e.target;
            setText(value);
            validateText(value);
          }}
        />
        <p className="text-xs text-muted-foreground">Paste a {embedConfig.contentName} URL to embed</p>
      </div>
      <div className="flex flex-row justify-end gap-2">
        <Button
          variant="outline"
          disabled={!embedResult}
          onClick={onClick}
          data-test-id={`${embedConfig.type}-embed-modal-submit-btn`}
        >
          Embed
        </Button>
      </div>
    </div>
  );
}

export default function AutoEmbedPlugin(): JSX.Element {
  const [modal, showModal] = useModal();

  const openEmbedModal = (embedConfig: PlaygroundEmbedConfig) => {
    showModal(`Embed ${embedConfig.contentName}`, (onClose) => (
      <AutoEmbedDialog embedConfig={embedConfig} onClose={onClose} />
    ));
  };

  const getMenuOptions = (activeEmbedConfig: PlaygroundEmbedConfig, embedFn: () => void, dismissFn: () => void) => {
    return [
      new AutoEmbedOption("Dismiss", {
        onSelect: dismissFn,
      }),
      new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
        onSelect: embedFn,
      }),
    ];
  };

  return (
    <>
      {modal}
      <LexicalAutoEmbedPlugin<PlaygroundEmbedConfig>
        embedConfigs={EmbedConfigs}
        onOpenEmbedModalForConfig={openEmbedModal}
        getMenuOptions={getMenuOptions}
        menuRenderFn={(anchorElementRef, { selectedIndex, options, selectOptionAndCleanUp, setHighlightedIndex }) =>
          anchorElementRef.current
            ? ReactDOM.createPortal(
                <div
                  className="typeahead-popover auto-embed-menu"
                  style={{
                    marginLeft: `${Math.max(Number.parseFloat(anchorElementRef.current.style.width) - 200, 0)}px`,
                    width: 200,
                  }}
                >
                  <AutoEmbedMenu
                    options={options}
                    selectedItemIndex={selectedIndex}
                    onOptionClick={(option: AutoEmbedOption, index: number) => {
                      setHighlightedIndex(index);
                      selectOptionAndCleanUp(option);
                    }}
                    onOptionMouseEnter={(index: number) => {
                      setHighlightedIndex(index);
                    }}
                  />
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
    </>
  );
}
