"use client";

import type {
  EmptyText,
  KEYS,
  PlainText,
  TBasicMarks,
  TCaptionProps,
  TComboboxInputElement,
  TCommentText,
  TElement,
  TFontMarks,
  TImageElement,
  TLineHeightProps,
  TLinkElement,
  TListProps,
  TMediaEmbedElement,
  TMentionElement,
  TResizableProps,
  TTableElement,
  TText,
  TTextAlignProps,
} from "platejs";

export interface MyBlockElement extends TElement, TListProps {
  id?: string;
}

/** Inline Elements */

export interface MyBlockquoteElement extends MyTextBlockElement {
  type: typeof KEYS.blockquote;
}

export interface MyCodeBlockElement extends MyBlockElement {
  children: MyCodeLineElement[];
  type: typeof KEYS.codeBlock;
}

export interface MyCodeLineElement extends TElement {
  children: PlainText[];
  type: typeof KEYS.codeLine;
}

export interface MyH1Element extends MyTextBlockElement {
  type: typeof KEYS.h1;
}

export interface MyH2Element extends MyTextBlockElement {
  type: typeof KEYS.h2;
}

export interface MyH3Element extends MyTextBlockElement {
  type: typeof KEYS.h3;
}

export interface MyHrElement extends MyBlockElement {
  children: [EmptyText];
  type: typeof KEYS.hr;
}

/** Block props */

export interface MyImageElement extends MyBlockElement, TCaptionProps, TImageElement, TResizableProps {
  children: [EmptyText];
  type: typeof KEYS.img;
}

export interface MyLinkElement extends TLinkElement {
  id: string;
  children: RichText[];
  type: typeof KEYS.link;
  icon?: string;
  title?: string;
}

export interface MyMediaEmbedElement extends MyBlockElement, TCaptionProps, TMediaEmbedElement, TResizableProps {
  children: [EmptyText];
  type: typeof KEYS.mediaEmbed;
}

export interface MyMentionElement extends TMentionElement {
  children: [EmptyText];
  type: typeof KEYS.mention;
  key?: string;
  coverImage?: string;
  icon?: string;
}

export interface MyMentionInputElement extends TComboboxInputElement {
  children: [PlainText];
  type: typeof KEYS.mentionInput;
}

export type MyNestableBlock = MyParagraphElement;

export interface MyParagraphElement extends MyTextBlockElement {
  type: typeof KEYS.p;
}

export interface MyTableCellElement extends TElement {
  children: MyNestableBlock[];
  type: typeof KEYS.td;
}

export interface MyTableElement extends MyBlockElement, TTableElement {
  children: MyTableRowElement[];
  type: typeof KEYS.table;
}

export interface MyTableRowElement extends TElement {
  children: MyTableCellElement[];
  type: typeof KEYS.tr;
}

export interface MyTextBlockElement extends TElement, TLineHeightProps, TTextAlignProps {
  children: (MyLinkElement | MyMentionElement | MyMentionInputElement | RichText)[];
}

export interface MyToggleElement extends MyTextBlockElement {
  type: typeof KEYS.toggle;
}

export type MyValue = (
  | MyBlockquoteElement
  | MyCodeBlockElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyHrElement
  | MyImageElement
  | MyMediaEmbedElement
  | MyParagraphElement
  | MyTableElement
  | MyToggleElement
)[];

export interface RichText extends TBasicMarks, TCommentText, TFontMarks, TText {
  kbd?: boolean;
}
