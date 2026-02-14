"use client";

import type { EditorThemeClasses } from "lexical";

import "./editor-theme.css";

/**
 * Lexical editor theme using Tailwind classes with shadcn/ui CSS variables.
 *
 * This theme maximizes Tailwind utility classes while keeping CSS-only
 * for features that require it (code syntax highlighting, complex selectors).
 */
export const editorTheme: EditorThemeClasses = {
  // Direction
  ltr: "text-left",
  rtl: "text-right",

  // Headings - shadcn typography styles
  heading: {
    h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-0 mb-4",
    h2: "scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight mt-8 mb-4 first:mt-0",
    h3: "scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-3",
    h4: "scroll-m-20 text-xl font-semibold tracking-tight mt-4 mb-2",
    h5: "scroll-m-20 text-lg font-semibold tracking-tight mt-4 mb-2",
    h6: "scroll-m-20 text-base font-semibold tracking-tight mt-4 mb-2",
  },

  // Paragraph
  paragraph: "m-0 relative leading-7",

  // Block quote - shadcn style
  quote: "mt-6 border-l-2 border-border pl-6 italic text-muted-foreground",

  // Links
  link: "text-primary underline-offset-4 hover:underline cursor-pointer",

  // Lists
  list: {
    checklist: "relative m-0 p-0",
    listitem: "mx-8 my-0",
    listitemChecked: "EditorTheme__listItemChecked",
    listitemUnchecked: "EditorTheme__listItemUnchecked",
    nested: {
      listitem: "list-none before:hidden after:hidden",
    },
    ol: "m-0 p-0 list-decimal",
    olDepth: [
      "list-outside list-decimal p-0 m-0",
      "list-outside list-[upper-alpha] p-0 m-0",
      "list-outside list-[lower-alpha] p-0 m-0",
      "list-outside list-[upper-roman] p-0 m-0",
      "list-outside list-[lower-roman] p-0 m-0",
    ],
    ul: "m-0 p-0 list-disc list-outside",
    ulDepth: [
      "list-outside list-disc p-0 m-0",
      "list-outside list-[circle] p-0 m-0",
      "list-outside list-[square] p-0 m-0",
      "list-outside list-disc p-0 m-0",
      "list-outside list-[circle] p-0 m-0",
    ],
  },

  // Hashtags
  hashtag: "text-primary bg-primary/10 rounded-md px-1",

  // Text formatting
  text: {
    bold: "font-bold",
    code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
    italic: "italic",
    strikethrough: "line-through",
    subscript: "text-[0.8em] align-sub",
    superscript: "text-[0.8em] align-super",
    underline: "underline",
    underlineStrikethrough: "[text-decoration:underline_line-through]",
    capitalize: "capitalize",
    lowercase: "lowercase",
    uppercase: "uppercase",
    highlight: "EditorTheme__textHighlight",
  },

  // Images
  image: "relative inline-block select-none cursor-default editor-image",
  inlineImage: "relative inline-block select-none cursor-default inline-editor-image",

  // Keywords
  keyword: "text-purple-700 dark:text-purple-400 font-bold",

  // Code blocks - require CSS for line numbers
  code: "EditorTheme__code",
  codeHighlight: {
    atrule: "EditorTheme__tokenAttr",
    attr: "EditorTheme__tokenAttr",
    boolean: "EditorTheme__tokenProperty",
    builtin: "EditorTheme__tokenSelector",
    cdata: "EditorTheme__tokenComment",
    char: "EditorTheme__tokenSelector",
    class: "EditorTheme__tokenFunction",
    "class-name": "EditorTheme__tokenFunction",
    comment: "EditorTheme__tokenComment",
    constant: "EditorTheme__tokenProperty",
    deleted: "EditorTheme__tokenDeleted",
    doctype: "EditorTheme__tokenComment",
    entity: "EditorTheme__tokenOperator",
    function: "EditorTheme__tokenFunction",
    important: "EditorTheme__tokenVariable",
    inserted: "EditorTheme__tokenInserted",
    keyword: "EditorTheme__tokenAttr",
    namespace: "EditorTheme__tokenVariable",
    number: "EditorTheme__tokenProperty",
    operator: "EditorTheme__tokenOperator",
    prolog: "EditorTheme__tokenComment",
    property: "EditorTheme__tokenProperty",
    punctuation: "EditorTheme__tokenPunctuation",
    regex: "EditorTheme__tokenVariable",
    selector: "EditorTheme__tokenSelector",
    string: "EditorTheme__tokenSelector",
    symbol: "EditorTheme__tokenProperty",
    tag: "EditorTheme__tokenProperty",
    unchanged: "EditorTheme__tokenUnchanged",
    url: "EditorTheme__tokenOperator",
    variable: "EditorTheme__tokenVariable",
  },

  // Character limit indicator
  characterLimit: "inline bg-destructive/50",

  // Tables - use CSS class for complex table styling
  table: "EditorTheme__table border-collapse border-spacing-0 overflow-y-auto overflow-x-auto table-fixed w-fit my-6",
  tableCell:
    "EditorTheme__tableCell border border-border w-[75px] align-top text-left p-2 relative outline-none overflow-auto",
  tableCellActionButton:
    "EditorTheme__tableCellActionButton bg-background block border-0 rounded-full w-5 h-5 text-foreground cursor-pointer hover:bg-muted",
  tableCellActionButtonContainer:
    "EditorTheme__tableCellActionButtonContainer block right-1 top-1.5 absolute z-10 w-5 h-5",
  tableCellEditing: "EditorTheme__tableCellEditing rounded-sm shadow-sm",
  tableCellHeader: "EditorTheme__tableCellHeader bg-muted border border-border p-2 text-left font-bold",
  tableCellPrimarySelected:
    "EditorTheme__tableCellPrimarySelected border-2 border-primary absolute block h-[calc(100%-2px)] w-[calc(100%-2px)] -left-px -top-px z-10",
  tableCellResizer: "EditorTheme__tableCellResizer absolute -right-1 h-full w-2 cursor-ew-resize z-10 top-0",
  tableCellSelected: "EditorTheme__tableCellSelected",
  tableCellSortedIndicator:
    "EditorTheme__tableCellSortedIndicator block opacity-50 absolute bottom-0 left-0 w-full h-1 bg-muted",
  tableResizeRuler: "EditorTheme__tableResizeRuler block absolute w-px h-full bg-primary top-0",
  tableRowStriping: "EditorTheme__tableRowStriping m-0 border-t border-border p-0 even:bg-muted/50",
  tableScrollableWrapper: "EditorTheme__tableScrollableWrapper overflow-x-auto mx-0 my-0 mb-8",
  tableSelected: "EditorTheme__tableSelected ring-2 ring-primary ring-offset-2 ring-offset-background",
  tableSelection: "EditorTheme__tableSelection bg-transparent",
  tableAddColumns: "EditorTheme__tableAddColumns",
  tableAddRows: "EditorTheme__tableAddRows",
  tableAlignment: {
    center: "mx-auto",
    right: "ml-auto",
  },
  tableFrozenColumn: "EditorTheme__tableFrozenColumn",
  tableFrozenRow: "EditorTheme__tableFrozenRow",

  // Layout containers
  layoutContainer: "grid gap-2.5 my-2.5 mx-0",
  layoutItem: "border border-dashed border-border px-4 py-2 min-w-0 max-w-full",

  // Autocomplete
  autocomplete: "text-muted-foreground",

  // Block cursor
  blockCursor: "EditorTheme__blockCursor",

  // Embed blocks
  embedBlock: {
    base: "select-none",
    focus: "ring-2 ring-primary ring-offset-2 ring-offset-background",
  },

  // Horizontal rule
  hr: "EditorTheme__hr",
  hrSelected: "EditorTheme__hrSelected",

  // Indentation
  indent: "[--lexical-indent-base-value:40px]",

  // Comment marks
  mark: "EditorTheme__mark",
  markOverlap: "EditorTheme__markOverlap",

  // Tab node (for underline/strikethrough on tabs)
  tab: "EditorTheme__tabNode",
};

/**
 * Comment editor theme - compact variant for inline comments
 */
export const commentEditorTheme: EditorThemeClasses = {
  ...editorTheme,
  paragraph: "m-0 relative text-sm",
};

/**
 * Sticky note editor theme - compact variant for sticky notes
 */
export const stickyEditorTheme: EditorThemeClasses = {
  ...editorTheme,
  paragraph: "m-0 relative text-sm",
};
