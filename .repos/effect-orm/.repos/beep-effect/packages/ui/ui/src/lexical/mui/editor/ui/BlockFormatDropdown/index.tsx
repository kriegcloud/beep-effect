import type { LexicalEditor } from "lexical";
import { type JSX, useMemo } from "react";

import { blockTypeToBlockName } from "../../context";
import {
  ChatSquareQuoteIcon,
  CodeIcon,
  ListOlIcon,
  ListUlIcon,
  SquareCheckIcon,
  TextParagraphIcon,
  TypeH1Icon,
  TypeH2Icon,
  TypeH3Icon,
  TypeH4Icon,
  TypeH5Icon,
  TypeH6Icon,
} from "../../images/icons";
import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts";
import {
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
} from "../../plugins/ToolbarPlugin/utils";
import type { TToolbarBlockFormatControl } from "../../types";
import { dropDownActiveClass } from "../../utils";
import { DropDown, DropDownItem } from "../DropDown";

export type BlockType = keyof typeof blockTypeToBlockName;

export interface IBlockFormatOptions {
  readonly blockType: BlockType;
  readonly title: string;
  readonly icon: () => JSX.Element;
  readonly shortcut: keyof typeof SHORTCUTS;
}

const formatBlockIcons: Record<BlockType, () => JSX.Element> = {
  paragraph: TextParagraphIcon,
  h1: TypeH1Icon,
  h2: TypeH2Icon,
  h3: TypeH3Icon,
  h4: TypeH4Icon,
  h5: TypeH5Icon,
  h6: TypeH6Icon,
  bullet: ListUlIcon,
  number: ListOlIcon,
  check: SquareCheckIcon,
  quote: ChatSquareQuoteIcon,
  code: CodeIcon,
};

const blockFormatOptions: Array<IBlockFormatOptions> = [
  {
    blockType: "paragraph",
    title: blockTypeToBlockName.paragraph,
    icon: formatBlockIcons.paragraph,
    shortcut: "NORMAL",
  },
  { blockType: "h1", title: blockTypeToBlockName.h1, icon: formatBlockIcons.h1, shortcut: "HEADING1" },
  { blockType: "h2", title: blockTypeToBlockName.h2, icon: formatBlockIcons.h2, shortcut: "HEADING2" },
  { blockType: "h3", title: blockTypeToBlockName.h3, icon: formatBlockIcons.h3, shortcut: "HEADING3" },
  { blockType: "h4", title: blockTypeToBlockName.h4, icon: formatBlockIcons.h4, shortcut: "HEADING4" },
  { blockType: "h5", title: blockTypeToBlockName.h5, icon: formatBlockIcons.h5, shortcut: "HEADING5" },
  { blockType: "h6", title: blockTypeToBlockName.h6, icon: formatBlockIcons.h6, shortcut: "HEADING6" },
  { blockType: "bullet", title: blockTypeToBlockName.bullet, icon: formatBlockIcons.bullet, shortcut: "BULLET_LIST" },
  { blockType: "number", title: blockTypeToBlockName.number, icon: formatBlockIcons.number, shortcut: "NUMBERED_LIST" },
  { blockType: "check", title: blockTypeToBlockName.check, icon: formatBlockIcons.check, shortcut: "CHECK_LIST" },
  { blockType: "quote", title: blockTypeToBlockName.quote, icon: formatBlockIcons.quote, shortcut: "QUOTE" },
  { blockType: "code", title: blockTypeToBlockName.code, icon: formatBlockIcons.code, shortcut: "CODE_BLOCK" },
];

export const BlockFormatDropDown = ({
  editor,
  blockType,
  disabled = false,
  controls = [],
}: {
  blockType: BlockType;
  editor: LexicalEditor;
  disabled?: undefined | boolean;
  controls?: undefined | Array<TToolbarBlockFormatControl>;
}): JSX.Element => {
  const onClItemClick = useMemo(() => {
    const clickActions: Record<BlockType, () => void> = {
      paragraph: () => formatParagraph(editor),
      h1: () => formatHeading(editor, blockType, "h1"),
      h2: () => formatHeading(editor, blockType, "h2"),
      h3: () => formatHeading(editor, blockType, "h3"),
      h4: () => formatHeading(editor, blockType, "h4"),
      h5: () => formatHeading(editor, blockType, "h5"),
      h6: () => formatHeading(editor, blockType, "h6"),
      bullet: () => formatBulletList(editor, blockType),
      number: () => formatNumberedList(editor, blockType),
      check: () => formatCheckList(editor, blockType),
      quote: () => formatQuote(editor, blockType),
      code: () => formatCode(editor, blockType),
    };
    return clickActions;
  }, [editor]);

  const Icon = formatBlockIcons[blockType];

  const filteredOptions = controls.length
    ? blockFormatOptions.filter((o) => controls.includes(o.blockType))
    : blockFormatOptions;

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls"
      icon={<Icon />}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style"
    >
      {filteredOptions.map((o) => {
        const Icon = o.icon;
        return (
          <DropDownItem
            key={o.blockType}
            className={`item wide ${dropDownActiveClass(blockType === o.blockType)}`}
            onClick={onClItemClick[o.blockType]}
          >
            <div className="icon-text-container">
              <Icon />
              <span className="text">{o.title}</span>
            </div>
            <span className="shortcut">{SHORTCUTS[o.shortcut]}</span>
          </DropDownItem>
        );
      })}
    </DropDown>
  );
};
