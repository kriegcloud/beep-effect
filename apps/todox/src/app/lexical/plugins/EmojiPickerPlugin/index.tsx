"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { $createTextNode, $getSelection, $isRangeSelection, type TextNode } from "lexical";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";

class EmojiOption extends MenuOption {
  readonly title: string;
  readonly emoji: string;
  readonly keywords: Array<string>;

  constructor(
    title: string,
    emoji: string,
    options: {
      readonly keywords?: undefined | Array<string>;
    }
  ) {
    super(title);
    this.title = title;
    this.emoji = emoji;
    this.keywords = options.keywords || [];
  }
}
function EmojiMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  readonly index: number;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly onMouseEnter: () => void;
  readonly option: EmojiOption;
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
      <span className="text">
        {option.emoji} {option.title}
      </span>
    </li>
  );
}

type Emoji = {
  readonly emoji: string;
  readonly description: string;
  readonly category: string;
  readonly aliases: Array<string>;
  readonly tags: Array<string>;
  readonly unicode_version: string;
  readonly ios_version: string;
  readonly skin_tones?: undefined | boolean;
};

const MAX_EMOJI_SUGGESTION_COUNT = 10;

export default function EmojiPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [emojis, setEmojis] = useState<Array<Emoji>>([]);

  useEffect(() => {
    let mounted = true;
    F.pipe(
      Effect.tryPromise(() => import("../../utils/emoji-list")),
      Effect.tap((file) =>
        Effect.sync(() => {
          if (mounted) {
            setEmojis(file.default);
          }
        })
      ),
      Effect.runPromise
    );
    return () => {
      mounted = false;
    };
  }, []);

  const emojiOptions = useMemo(
    () =>
      emojis != null
        ? emojis.map(
            ({ emoji, aliases, tags }) =>
              new EmojiOption(aliases[0]!, emoji, {
                keywords: [...aliases, ...tags],
              })
          )
        : [],
    [emojis]
  );

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(":", {
    minLength: 0,
    punctuation: "\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\[\\]\\\\/!%'\"~=<>:;", // allow _ and -
  });

  const options: Array<EmojiOption> = useMemo(() => {
    // When no query string, return all options (limited)
    if (queryString == null) {
      return A.take(emojiOptions, MAX_EMOJI_SUGGESTION_COUNT);
    }

    // Cache the regex for performance (used multiple times in filter loop)
    const pattern = new RegExp(queryString, "gi");

    return F.pipe(
      emojiOptions,
      A.filter((option: EmojiOption) => {
        // Check if title matches
        const titleMatch = O.isSome(Str.match(pattern)(option.title));
        if (titleMatch) return true;

        // Check if any keyword matches
        return A.some(option.keywords, (keyword: string) => O.isSome(Str.match(pattern)(keyword)));
      }),
      A.take(MAX_EMOJI_SUGGESTION_COUNT)
    );
  }, [emojiOptions, queryString]);

  const onSelectOption = useCallback(
    (selectedOption: EmojiOption, nodeToRemove: TextNode | null, closeMenu: () => void) => {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || selectedOption == null) {
          return;
        }

        if (nodeToRemove) {
          nodeToRemove.remove();
        }

        selection.insertNodes([$createTextNode(selectedOption.emoji)]);

        closeMenu();
      });
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
        if (anchorElementRef.current == null || options.length === 0) {
          return null;
        }

        return anchorElementRef.current && options.length
          ? ReactDOM.createPortal(
              <div className="typeahead-popover emoji-menu">
                <ul>
                  {options.map((option: EmojiOption, index) => (
                    <EmojiMenuItem
                      key={option.key}
                      index={index}
                      isSelected={selectedIndex === index}
                      onClick={() => {
                        setHighlightedIndex(index);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(index);
                      }}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null;
      }}
    />
  );
}
