"use client";

import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/extension";
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  GifIcon,
  ImageIcon,
  ListBulletsIcon,
  ListChecksIcon,
  ListNumbersIcon,
  MinusIcon,
  QuotesIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextHOneIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import * as O from "effect/Option";
import * as Str from "effect/String";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  type LexicalEditor,
  type TextNode,
} from "lexical";
import type { JSX } from "react";
import { useCallback, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";

import useModal from "../../hooks/useModal";
import catTypingGif from "../../images/cat-typing.gif";
import { INSERT_IMAGE_COMMAND, InsertImageDialog } from "../ImagesPlugin";

export class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  readonly title: string;
  // Icon for display
  readonly icon?: JSX.Element;
  // For extra searching.
  readonly keywords: Array<string>;
  // TBD
  readonly keyboardShortcut?: undefined | string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      readonly icon?: undefined | JSX.Element;
      readonly keywords?: undefined | Array<string>;
      readonly keyboardShortcut?: undefined | string;
      readonly onSelect: (queryString: string) => void;
    }
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

export function ComponentPickerMenuItem({
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
  readonly option: ComponentPickerOption;
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
      {option.icon}
      <span className="text">{option.title}</span>
    </li>
  );
}

export function getDynamicOptions(_editor: LexicalEditor, _queryString: string) {
  return [] as Array<ComponentPickerOption>;
}

export type ShowModal = ReturnType<typeof useModal>[1];

export function getBaseOptions(editor: LexicalEditor, showModal: ShowModal) {
  return [
    new ComponentPickerOption("Paragraph", {
      icon: <TextTIcon className="size-4" />,
      keywords: ["normal", "paragraph", "p", "text"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
    }),
    new ComponentPickerOption("Heading 1", {
      icon: <TextHOneIcon className="size-4" />,
      keywords: ["heading", "header", "h1"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h1"));
          }
        }),
    }),
    new ComponentPickerOption("Heading 2", {
      icon: <TextHTwoIcon className="size-4" />,
      keywords: ["heading", "header", "h2"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h2"));
          }
        }),
    }),
    new ComponentPickerOption("Heading 3", {
      icon: <TextHThreeIcon className="size-4" />,
      keywords: ["heading", "header", "h3"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h3"));
          }
        }),
    }),
    new ComponentPickerOption("Numbered List", {
      icon: <ListNumbersIcon className="size-4" />,
      keywords: ["numbered list", "ordered list", "ol"],
      onSelect: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: <ListBulletsIcon className="size-4" />,
      keywords: ["bulleted list", "unordered list", "ul"],
      onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Check List", {
      icon: <ListChecksIcon className="size-4" />,
      keywords: ["check list", "todo list"],
      onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Quote", {
      icon: <QuotesIcon className="size-4" />,
      keywords: ["block quote"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption("Divider", {
      icon: <MinusIcon className="size-4" />,
      keywords: ["horizontal rule", "divider", "hr"],
      onSelect: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),
    new ComponentPickerOption("GIF", {
      icon: <GifIcon className="size-4" />,
      keywords: ["gif", "animate", "image", "file"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          altText: "Cat typing on a laptop",
          src: catTypingGif.src,
        }),
    }),
    new ComponentPickerOption("Image", {
      icon: <ImageIcon className="size-4" />,
      keywords: ["image", "photo", "picture", "file"],
      onSelect: () =>
        showModal("Insert Image", (onClose) => <InsertImageDialog activeEditor={editor} onClose={onClose} />),
    }),
    new ComponentPickerOption("Align left", {
      icon: <TextAlignLeftIcon className="size-4" />,
      keywords: ["align", "justify", "left"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
    }),
    new ComponentPickerOption("Align center", {
      icon: <TextAlignCenterIcon className="size-4" />,
      keywords: ["align", "justify", "center"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
    }),
    new ComponentPickerOption("Align right", {
      icon: <TextAlignRightIcon className="size-4" />,
      keywords: ["align", "justify", "right"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
    }),
    new ComponentPickerOption("Align justify", {
      icon: <TextAlignJustifyIcon className="size-4" />,
      keywords: ["align", "justify", "justify"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
    }),
  ];
}

export default function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    allowWhitespace: true,
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...getDynamicOptions(editor, queryString),
      ...baseOptions.filter(
        (option) =>
          O.isSome(Str.match(regex)(option.title)) ||
          option.keywords.some((keyword) => O.isSome(Str.match(regex)(keyword)))
      ),
    ];
  }, [editor, queryString, showModal]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) =>
          anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
                <div className="typeahead-popover component-picker-menu">
                  <ul>
                    {options.map((option, i: number) => (
                      <ComponentPickerMenuItem
                        index={i}
                        isSelected={selectedIndex === i}
                        onClick={() => {
                          setHighlightedIndex(i);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(i);
                        }}
                        key={option.key}
                        option={option}
                      />
                    ))}
                  </ul>
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
    </>
  );
}
