import type { CommandProps } from "@tiptap/core";

import { Mark } from "@tiptap/core";

// ----------------------------------------------------------------------

export type TextTransformValue = "uppercase" | "lowercase" | "capitalize";

export interface TextTransformOptions {
  allowedValues: TextTransformValue[];
  defaultValue?: TextTransformValue;
}

export interface TextTransformAttributes {
  textTransform?: TextTransformValue;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textTransform: {
      unsetTextTransform: () => ReturnType;
      setTextTransform: (value: TextTransformValue) => ReturnType;
      toggleTextTransform: (value: TextTransformValue) => ReturnType;
    };
  }
}

const isHTMLElement = (node: unknown): node is HTMLElement => node instanceof HTMLElement;

const isValidTextTransform = (value: unknown, allowed: readonly TextTransformValue[]): value is TextTransformValue =>
  typeof value === "string" && allowed.includes(value as TextTransformValue);

// ----------------------------------------------------------------------

export const TextTransform = Mark.create<TextTransformOptions, TextTransformAttributes>({
  name: "textTransform",
  /********/
  addOptions() {
    return {
      allowedValues: ["uppercase", "lowercase", "capitalize"],
      defaultValue: undefined,
    };
  },
  /********/
  addAttributes() {
    return {
      textTransform: {
        default: this.options.defaultValue,
        parseHTML: (element): TextTransformValue | undefined => {
          if (!isHTMLElement(element)) return undefined;

          const rawValue =
            element.style.textTransform || element.getAttribute("style")?.match(/text-transform:\s*(\w+)/)?.[1];

          return isValidTextTransform(rawValue, this.options.allowedValues) ? rawValue : undefined;
        },
        renderHTML: (attributes: TextTransformAttributes): Record<string, string> => {
          if (!attributes.textTransform) return {};
          return {
            style: `text-transform: ${attributes.textTransform}`,
          };
        },
      },
    };
  },
  /********/
  parseHTML() {
    return [
      {
        tag: "span[style]",
        getAttrs: (node) => {
          if (!isHTMLElement(node)) return null;

          const styleValue = node.style.textTransform;
          return isValidTextTransform(styleValue, this.options.allowedValues) ? {} : false;
        },
      },
    ];
  },
  /********/
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  /********/
  addCommands() {
    return {
      /**
       * ➤ Set the text transform
       */
      setTextTransform:
        (value: TextTransformValue) =>
        ({ commands }: CommandProps): boolean => {
          if (!isValidTextTransform(value, this.options.allowedValues)) return false;

          return commands.setMark(this.name, { textTransform: value });
        },
      /**
       * ➤ Unset the text transform
       */
      unsetTextTransform:
        () =>
        ({ commands }: CommandProps): boolean =>
          commands.unsetMark(this.name),
      /**
       * ➤ Toggle the text transform
       */
      toggleTextTransform:
        (value: TextTransformValue) =>
        ({ editor, commands }: CommandProps): boolean => {
          if (!isValidTextTransform(value, this.options.allowedValues)) return false;

          const isActive = editor.isActive(this.name, { textTransform: value });
          return isActive ? commands.unsetTextTransform() : commands.setTextTransform(value);
        },
    };
  },
});
