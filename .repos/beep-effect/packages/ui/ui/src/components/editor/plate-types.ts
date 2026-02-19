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
  readonly id?: undefined | string;
}

export interface MyTextBlockElement extends TElement, TLineHeightProps, TTextAlignProps {
  readonly children: (MyLinkElement | MyMentionElement | MyMentionInputElement | RichText)[];
}

export interface MyBlockquoteElement extends MyTextBlockElement {
  readonly type: typeof KEYS.blockquote;
}

export interface MyCodeBlockElement extends MyBlockElement {
  readonly children: MyCodeLineElement[];
  readonly type: typeof KEYS.codeBlock;
}

export interface MyCodeLineElement extends TElement {
  readonly children: PlainText[];
  readonly type: typeof KEYS.codeLine;
}

export interface MyH1Element extends MyTextBlockElement {
  readonly type: typeof KEYS.h1;
}

export interface MyH2Element extends MyTextBlockElement {
  readonly type: typeof KEYS.h2;
}

/** Block props */

export interface MyH3Element extends MyTextBlockElement {
  readonly type: typeof KEYS.h3;
}

export interface MyH4Element extends MyTextBlockElement {
  readonly type: typeof KEYS.h4;
}

export interface MyH5Element extends MyTextBlockElement {
  readonly type: typeof KEYS.h5;
}

export interface MyH6Element extends MyTextBlockElement {
  readonly type: typeof KEYS.h6;
}

export interface MyHrElement extends MyBlockElement {
  readonly children: [EmptyText];
  readonly type: typeof KEYS.hr;
}

export interface MyImageElement
  extends Omit<MyBlockElement, "caption">,
    Omit<TCaptionProps, "caption">,
    TImageElement,
    TResizableProps {
  readonly caption?: string | undefined;
  readonly children: [EmptyText];
  readonly type: typeof KEYS.img;
}

export interface MyLinkElement extends TLinkElement {
  readonly children: RichText[];
  readonly type: typeof KEYS.link;
}

export interface MyMediaEmbedElement
  extends Omit<MyBlockElement, "caption">,
    Omit<TCaptionProps, "caption">,
    TMediaEmbedElement,
    TResizableProps {
  readonly caption?: string | undefined;
  readonly children: [EmptyText];
  readonly type: typeof KEYS.mediaEmbed;
}

export interface MyMentionElement extends TMentionElement {
  readonly children: [EmptyText];
  readonly type: typeof KEYS.mention;
}

export interface MyMentionInputElement extends TComboboxInputElement {
  readonly children: [PlainText];
  readonly type: typeof KEYS.mentionInput;
}

export type MyNestableBlock = MyParagraphElement;

export interface MyParagraphElement extends MyTextBlockElement {
  readonly type: typeof KEYS.p;
}

export interface MyTableCellElement extends TElement {
  readonly children: MyNestableBlock[];
  readonly type: typeof KEYS.td;
}

export interface MyTableElement extends MyBlockElement, TTableElement {
  readonly children: MyTableRowElement[];
  readonly type: typeof KEYS.table;
}

export interface MyTableRowElement extends TElement {
  readonly children: MyTableCellElement[];
  readonly type: typeof KEYS.tr;
}

export interface MyToggleElement extends MyTextBlockElement {
  readonly type: typeof KEYS.toggle;
}

export interface RichText extends TBasicMarks, TCommentText, TFontMarks, TText {
  readonly kbd?: undefined | boolean;
}

export type MyValue = (
  | MyBlockquoteElement
  | MyCodeBlockElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyH4Element
  | MyH5Element
  | MyH6Element
  | MyHrElement
  | MyImageElement
  | MyMediaEmbedElement
  | MyParagraphElement
  | MyTableElement
  | MyToggleElement
)[];
