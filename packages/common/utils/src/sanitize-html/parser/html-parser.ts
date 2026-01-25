/**
 * HTML parser using a state machine approach
 *
 * This parser tokenizes HTML into a stream of tokens (StartTag, EndTag, Text, Comment).
 * It follows the HTML5 parsing specification for handling edge cases.
 *
 * @since 0.1.0
 * @module
 */

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import type { Attributes, ParserOptions } from "../types.js";
import { decodeEntities } from "./entities.js";
import type { Token } from "./token.js";
import * as T from "./token.js";

/**
 * Parser states following HTML5 spec.
 */
type ParserState =
  | "DATA"
  | "TAG_OPEN"
  | "END_TAG_OPEN"
  | "TAG_NAME"
  | "END_TAG_NAME"
  | "BEFORE_ATTRIBUTE_NAME"
  | "ATTRIBUTE_NAME"
  | "AFTER_ATTRIBUTE_NAME"
  | "BEFORE_ATTRIBUTE_VALUE"
  | "ATTRIBUTE_VALUE_DOUBLE"
  | "ATTRIBUTE_VALUE_SINGLE"
  | "ATTRIBUTE_VALUE_UNQUOTED"
  | "SELF_CLOSING_START_TAG"
  | "MARKUP_DECLARATION_OPEN"
  | "COMMENT_START"
  | "COMMENT"
  | "COMMENT_END_DASH"
  | "COMMENT_END"
  | "DOCTYPE"
  | "BOGUS_COMMENT";

/**
 * Mutable parser context for internal use.
 */
interface ParserContext {
  input: string;
  position: number;
  state: ParserState;
  tokens: Token[];
  buffer: string;
  tagName: string;
  attributeName: string;
  attributeValue: string;
  attributes: Record<string, string>;
  selfClosing: boolean;
  options: Required<ParserOptions>;
}

/**
 * Character predicates for parsing.
 */
const isTagNameChar = (char: string): boolean => /^[a-zA-Z0-9]$/.test(char);

const isWhitespaceChar = (char: string): boolean =>
  char === " " || char === "\t" || char === "\n" || char === "\r" || char === "\f";

const isEmptyChar = (char: string): boolean => char === "";

const isLessThan = (char: string): boolean => char === "<";

const isGreaterThan = (char: string): boolean => char === ">";

const isSlash = (char: string): boolean => char === "/";

const isExclamation = (char: string): boolean => char === "!";

const isQuestion = (char: string): boolean => char === "?";

const isEquals = (char: string): boolean => char === "=";

const isDoubleQuote = (char: string): boolean => char === '"';

const isSingleQuote = (char: string): boolean => char === "'";

const isDash = (char: string): boolean => char === "-";

/**
 * Check if attribute name is valid per HTML spec.
 */
const isValidAttributeName = (name: string): boolean => Str.length(name) > 0 && /^[^\0\t\n\f\r /<=>]+$/.test(name);

/**
 * Create initial parser context.
 */
const createContext = (input: string, options: Required<ParserOptions>): ParserContext => ({
  input,
  position: 0,
  state: "DATA",
  tokens: [],
  buffer: "",
  tagName: "",
  attributeName: "",
  attributeValue: "",
  attributes: {},
  selfClosing: false,
  options,
});

/**
 * Get current character.
 */
const currentChar = (ctx: ParserContext): string =>
  ctx.position < Str.length(ctx.input) ? ctx.input[ctx.position]! : "";

/**
 * Look ahead by n characters.
 */
const peek = (ctx: ParserContext, n: number): string => Str.slice(ctx.position, ctx.position + n)(ctx.input);

/**
 * Check if at end of input.
 */
const isEof = (ctx: ParserContext): boolean => ctx.position >= Str.length(ctx.input);

/**
 * Advance position by n characters.
 */
const advance = (ctx: ParserContext, n = 1): void => {
  ctx.position += n;
};

/**
 * Emit accumulated text as a token.
 */
const emitText = (ctx: ParserContext): void => {
  if (Str.length(ctx.buffer) > 0) {
    const content = ctx.options.decodeEntities ? decodeEntities(ctx.buffer) : ctx.buffer;
    ctx.tokens.push(T.text(content));
    ctx.buffer = "";
  }
};

/**
 * Emit a start tag token.
 */
const emitStartTag = (ctx: ParserContext): void => {
  const name = ctx.options.lowerCaseTags ? Str.toLowerCase(ctx.tagName) : ctx.tagName;

  // Process attributes
  const attrs: Attributes = {};
  for (const [key, value] of Struct.entries(ctx.attributes)) {
    const attrName = ctx.options.lowerCaseAttributeNames ? Str.toLowerCase(key) : key;
    if (isValidAttributeName(attrName)) {
      attrs[attrName] = ctx.options.decodeEntities ? decodeEntities(value) : value;
    }
  }

  ctx.tokens.push(T.startTag(name, attrs, ctx.selfClosing));
  resetTagState(ctx);
};

/**
 * Emit an end tag token.
 */
const emitEndTag = (ctx: ParserContext): void => {
  const name = ctx.options.lowerCaseTags ? Str.toLowerCase(ctx.tagName) : ctx.tagName;
  ctx.tokens.push(T.endTag(name));
  resetTagState(ctx);
};

/**
 * Emit a comment token.
 */
const emitComment = (ctx: ParserContext): void => {
  ctx.tokens.push(T.comment(ctx.buffer));
  ctx.buffer = "";
};

/**
 * Emit a doctype token.
 */
const emitDoctype = (ctx: ParserContext): void => {
  ctx.tokens.push(T.doctype(ctx.buffer));
  ctx.buffer = "";
};

/**
 * Reset tag parsing state.
 */
const resetTagState = (ctx: ParserContext): void => {
  ctx.tagName = "";
  ctx.attributeName = "";
  ctx.attributeValue = "";
  ctx.attributes = {};
  ctx.selfClosing = false;
};

/**
 * Save current attribute.
 */
const saveAttribute = (ctx: ParserContext): void => {
  if (Str.length(ctx.attributeName) > 0) {
    const name = ctx.options.lowerCaseAttributeNames ? Str.toLowerCase(ctx.attributeName) : ctx.attributeName;
    ctx.attributes[name] = ctx.attributeValue;
  }
  ctx.attributeName = "";
  ctx.attributeValue = "";
};

/**
 * Handle DATA state - normal text content.
 */
const handleDataState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isLessThan, () => {
      emitText(ctx);
      ctx.state = "TAG_OPEN";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      emitText(ctx);
    }),
    Match.orElse(() => {
      ctx.buffer += char;
      advance(ctx);
    })
  );
};

/**
 * Handle TAG_OPEN state - after '<'.
 */
const handleTagOpenState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isSlash, () => {
      ctx.state = "END_TAG_OPEN";
      advance(ctx);
    }),
    Match.when(isExclamation, () => {
      ctx.state = "MARKUP_DECLARATION_OPEN";
      advance(ctx);
    }),
    Match.when(isQuestion, () => {
      // Processing instruction - treat as bogus comment
      ctx.state = "BOGUS_COMMENT";
      advance(ctx);
    }),
    Match.when(isTagNameChar, () => {
      ctx.state = "TAG_NAME";
      ctx.tagName = char;
      advance(ctx);
    }),
    Match.orElse(() => {
      // Invalid tag open, emit as text
      ctx.buffer += "<";
      ctx.state = "DATA";
    })
  );
};

/**
 * Handle END_TAG_OPEN state - after '</'.
 */
const handleEndTagOpenState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isTagNameChar, () => {
      ctx.state = "END_TAG_NAME";
      ctx.tagName = char;
      advance(ctx);
    }),
    Match.when(isGreaterThan, () => {
      // Empty end tag, ignore
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.orElse(() => {
      // Invalid end tag open, emit as text
      ctx.buffer += "</";
      ctx.state = "DATA";
    })
  );
};

/**
 * Handle TAG_NAME state - reading tag name.
 */
const handleTagNameState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isWhitespaceChar, () => {
      ctx.state = "BEFORE_ATTRIBUTE_NAME";
      advance(ctx);
    }),
    Match.when(isSlash, () => {
      ctx.state = "SELF_CLOSING_START_TAG";
      advance(ctx);
    }),
    Match.when(isGreaterThan, () => {
      emitStartTag(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      // EOF in tag, emit what we have
      ctx.buffer += `<${ctx.tagName}`;
      ctx.state = "DATA";
      resetTagState(ctx);
    }),
    Match.orElse(() => {
      ctx.tagName += char;
      advance(ctx);
    })
  );
};

/**
 * Handle END_TAG_NAME state - reading end tag name.
 */
const handleEndTagNameState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isWhitespaceChar, () => {
      // Ignore attributes on end tags, skip to >
      while (!isEof(ctx) && !isGreaterThan(currentChar(ctx))) {
        advance(ctx);
      }
      if (isGreaterThan(currentChar(ctx))) {
        emitEndTag(ctx);
        advance(ctx);
      }
      ctx.state = "DATA";
    }),
    Match.when(isGreaterThan, () => {
      emitEndTag(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      // EOF in end tag
      ctx.buffer += `</${ctx.tagName}`;
      ctx.state = "DATA";
      resetTagState(ctx);
    }),
    Match.orElse(() => {
      ctx.tagName += char;
      advance(ctx);
    })
  );
};

/**
 * Handle BEFORE_ATTRIBUTE_NAME state.
 */
const handleBeforeAttributeNameState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isWhitespaceChar, () => {
      advance(ctx);
    }),
    Match.when(isSlash, () => {
      ctx.state = "SELF_CLOSING_START_TAG";
      advance(ctx);
    }),
    Match.when(isGreaterThan, () => {
      emitStartTag(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEquals, () => {
      // Invalid but handle gracefully
      ctx.attributeName = "=";
      ctx.state = "ATTRIBUTE_NAME";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      // EOF
      emitStartTag(ctx);
    }),
    Match.orElse(() => {
      ctx.attributeName = char;
      ctx.state = "ATTRIBUTE_NAME";
      advance(ctx);
    })
  );
};

/**
 * Handle ATTRIBUTE_NAME state.
 */
const handleAttributeNameState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isWhitespaceChar, () => {
      ctx.state = "AFTER_ATTRIBUTE_NAME";
      advance(ctx);
    }),
    Match.when(isSlash, () => {
      saveAttribute(ctx);
      ctx.state = "SELF_CLOSING_START_TAG";
      advance(ctx);
    }),
    Match.when(isEquals, () => {
      ctx.state = "BEFORE_ATTRIBUTE_VALUE";
      advance(ctx);
    }),
    Match.when(isGreaterThan, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
    }),
    Match.orElse(() => {
      ctx.attributeName += char;
      advance(ctx);
    })
  );
};

/**
 * Handle AFTER_ATTRIBUTE_NAME state.
 */
const handleAfterAttributeNameState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isWhitespaceChar, () => {
      advance(ctx);
    }),
    Match.when(isSlash, () => {
      saveAttribute(ctx);
      ctx.state = "SELF_CLOSING_START_TAG";
      advance(ctx);
    }),
    Match.when(isEquals, () => {
      ctx.state = "BEFORE_ATTRIBUTE_VALUE";
      advance(ctx);
    }),
    Match.when(isGreaterThan, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
    }),
    Match.orElse(() => {
      // New attribute without value
      saveAttribute(ctx);
      ctx.attributeName = char;
      ctx.state = "ATTRIBUTE_NAME";
      advance(ctx);
    })
  );
};

/**
 * Handle BEFORE_ATTRIBUTE_VALUE state.
 */
const handleBeforeAttributeValueState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isWhitespaceChar, () => {
      advance(ctx);
    }),
    Match.when(isDoubleQuote, () => {
      ctx.state = "ATTRIBUTE_VALUE_DOUBLE";
      advance(ctx);
    }),
    Match.when(isSingleQuote, () => {
      ctx.state = "ATTRIBUTE_VALUE_SINGLE";
      advance(ctx);
    }),
    Match.when(isGreaterThan, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
    }),
    Match.orElse(() => {
      ctx.attributeValue = char;
      ctx.state = "ATTRIBUTE_VALUE_UNQUOTED";
      advance(ctx);
    })
  );
};

/**
 * Handle ATTRIBUTE_VALUE_DOUBLE state.
 */
const handleAttributeValueDoubleState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isDoubleQuote, () => {
      saveAttribute(ctx);
      ctx.state = "BEFORE_ATTRIBUTE_NAME";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
    }),
    Match.orElse(() => {
      ctx.attributeValue += char;
      advance(ctx);
    })
  );
};

/**
 * Handle ATTRIBUTE_VALUE_SINGLE state.
 */
const handleAttributeValueSingleState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isSingleQuote, () => {
      saveAttribute(ctx);
      ctx.state = "BEFORE_ATTRIBUTE_NAME";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
    }),
    Match.orElse(() => {
      ctx.attributeValue += char;
      advance(ctx);
    })
  );
};

/**
 * Handle ATTRIBUTE_VALUE_UNQUOTED state.
 */
const handleAttributeValueUnquotedState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isWhitespaceChar, () => {
      saveAttribute(ctx);
      ctx.state = "BEFORE_ATTRIBUTE_NAME";
      advance(ctx);
    }),
    Match.when(isGreaterThan, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      saveAttribute(ctx);
      emitStartTag(ctx);
    }),
    Match.orElse(() => {
      ctx.attributeValue += char;
      advance(ctx);
    })
  );
};

/**
 * Handle SELF_CLOSING_START_TAG state.
 */
const handleSelfClosingStartTagState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isGreaterThan, () => {
      ctx.selfClosing = true;
      emitStartTag(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      emitStartTag(ctx);
    }),
    Match.orElse(() => {
      // Invalid, treat as before attribute name
      ctx.state = "BEFORE_ATTRIBUTE_NAME";
    })
  );
};

/**
 * Handle MARKUP_DECLARATION_OPEN state - after '<!'.
 */
const handleMarkupDeclarationOpenState = (ctx: ParserContext): void => {
  const peeked2 = peek(ctx, 2);
  const peeked7 = peek(ctx, 7);

  pipe(
    Match.value(true as boolean),
    Match.when(
      () => peeked2 === "--",
      () => {
        ctx.state = "COMMENT_START";
        advance(ctx, 2);
      }
    ),
    Match.when(
      () => Str.toUpperCase(peeked7) === "DOCTYPE",
      () => {
        ctx.state = "DOCTYPE";
        advance(ctx, 7);
      }
    ),
    Match.when(
      () => peeked7 === "[CDATA[",
      () => {
        // CDATA - treat as bogus comment
        ctx.state = "BOGUS_COMMENT";
        advance(ctx, 7);
      }
    ),
    Match.orElse(() => {
      ctx.state = "BOGUS_COMMENT";
    })
  );
};

/**
 * Handle COMMENT_START state - after '<!--'.
 */
const handleCommentStartState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isDash, () => {
      ctx.state = "COMMENT_END_DASH";
      advance(ctx);
    }),
    Match.when(isGreaterThan, () => {
      emitComment(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      emitComment(ctx);
    }),
    Match.orElse(() => {
      ctx.buffer += char;
      ctx.state = "COMMENT";
      advance(ctx);
    })
  );
};

/**
 * Handle COMMENT state.
 */
const handleCommentState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isDash, () => {
      ctx.state = "COMMENT_END_DASH";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      emitComment(ctx);
    }),
    Match.orElse(() => {
      ctx.buffer += char;
      advance(ctx);
    })
  );
};

/**
 * Handle COMMENT_END_DASH state.
 */
const handleCommentEndDashState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isDash, () => {
      ctx.state = "COMMENT_END";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      ctx.buffer += "-";
      emitComment(ctx);
    }),
    Match.orElse(() => {
      ctx.buffer += `-${char}`;
      ctx.state = "COMMENT";
      advance(ctx);
    })
  );
};

/**
 * Handle COMMENT_END state.
 */
const handleCommentEndState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isGreaterThan, () => {
      emitComment(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isDash, () => {
      ctx.buffer += "-";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      ctx.buffer += "--";
      emitComment(ctx);
    }),
    Match.orElse(() => {
      ctx.buffer += `--${char}`;
      ctx.state = "COMMENT";
      advance(ctx);
    })
  );
};

/**
 * Handle DOCTYPE state.
 */
const handleDoctypeState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isGreaterThan, () => {
      emitDoctype(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      emitDoctype(ctx);
    }),
    Match.orElse(() => {
      ctx.buffer += char;
      advance(ctx);
    })
  );
};

/**
 * Handle BOGUS_COMMENT state.
 */
const handleBogusCommentState = (ctx: ParserContext): void => {
  const char = currentChar(ctx);

  pipe(
    Match.value(char),
    Match.when(isGreaterThan, () => {
      emitComment(ctx);
      ctx.state = "DATA";
      advance(ctx);
    }),
    Match.when(isEmptyChar, () => {
      emitComment(ctx);
    }),
    Match.orElse(() => {
      ctx.buffer += char;
      advance(ctx);
    })
  );
};

/**
 * State handler dispatch using Match for exhaustive pattern matching.
 */
const stateHandlers: Record<ParserState, (ctx: ParserContext) => void> = {
  DATA: handleDataState,
  TAG_OPEN: handleTagOpenState,
  END_TAG_OPEN: handleEndTagOpenState,
  TAG_NAME: handleTagNameState,
  END_TAG_NAME: handleEndTagNameState,
  BEFORE_ATTRIBUTE_NAME: handleBeforeAttributeNameState,
  ATTRIBUTE_NAME: handleAttributeNameState,
  AFTER_ATTRIBUTE_NAME: handleAfterAttributeNameState,
  BEFORE_ATTRIBUTE_VALUE: handleBeforeAttributeValueState,
  ATTRIBUTE_VALUE_DOUBLE: handleAttributeValueDoubleState,
  ATTRIBUTE_VALUE_SINGLE: handleAttributeValueSingleState,
  ATTRIBUTE_VALUE_UNQUOTED: handleAttributeValueUnquotedState,
  SELF_CLOSING_START_TAG: handleSelfClosingStartTagState,
  MARKUP_DECLARATION_OPEN: handleMarkupDeclarationOpenState,
  COMMENT_START: handleCommentStartState,
  COMMENT: handleCommentState,
  COMMENT_END_DASH: handleCommentEndDashState,
  COMMENT_END: handleCommentEndState,
  DOCTYPE: handleDoctypeState,
  BOGUS_COMMENT: handleBogusCommentState,
};

/**
 * Process one step of the state machine.
 *
 * Uses a record lookup for state dispatch. The `Record<ParserState, ...>` type
 * ensures exhaustive coverage at compile time - if a new state is added to
 * ParserState, TypeScript will require a corresponding handler in stateHandlers.
 */
const step = (ctx: ParserContext): void => {
  stateHandlers[ctx.state](ctx);
};

/**
 * Default parser options.
 */
const defaultOptions: Required<ParserOptions> = {
  decodeEntities: true,
  lowerCaseTags: true,
  lowerCaseAttributeNames: true,
};

/**
 * Parse HTML string into tokens.
 *
 * @example
 * ```typescript
 * import { parseHtml } from "@beep/utils/sanitize-html/parser/html-parser"
 *
 * const tokens = parseHtml("<div class='test'>Hello</div>")
 * // [
 * //   { _tag: "StartTag", name: "div", attributes: { class: "test" }, selfClosing: false },
 * //   { _tag: "Text", content: "Hello" },
 * //   { _tag: "EndTag", name: "div" }
 * // ]
 * ```
 *
 * @since 0.1.0
 * @category parsing
 */
export const parseHtml = (html: string, options: ParserOptions = {}): readonly Token[] => {
  const mergedOptions: Required<ParserOptions> = {
    ...defaultOptions,
    ...options,
  };

  const ctx = createContext(html, mergedOptions);

  while (!isEof(ctx)) {
    step(ctx);
  }

  // Handle any remaining state
  pipe(
    Match.value(ctx.state !== "DATA"),
    Match.when(true, () => {
      // Emit any buffered content
      if (Str.length(ctx.buffer) > 0) {
        emitText(ctx);
      }
    }),
    Match.orElse(() => {
      emitText(ctx);
    })
  );

  return ctx.tokens;
};

/**
 * Token handler type for callback-based parsing.
 */
type TokenHandler = (token: Token) => void;

/**
 * Create a token handler that dispatches to the appropriate callback.
 */
const createTokenHandler =
  (callbacks: {
    onOpenTag?: undefined | ((name: string, attributes: Attributes, selfClosing: boolean) => void);
    onCloseTag?: undefined | ((name: string) => void);
    onText?: undefined | ((content: string) => void);
    onComment?: undefined | ((content: string) => void);
    onDoctype?: undefined | ((content: string) => void);
  }): TokenHandler =>
  (token: Token): void => {
    pipe(
      Match.value(token),
      Match.when({ _tag: "StartTag" }, (t) => {
        callbacks.onOpenTag?.(t.name, t.attributes, t.selfClosing);
      }),
      Match.when({ _tag: "EndTag" }, (t) => {
        callbacks.onCloseTag?.(t.name);
      }),
      Match.when({ _tag: "Text" }, (t) => {
        callbacks.onText?.(t.content);
      }),
      Match.when({ _tag: "Comment" }, (t) => {
        callbacks.onComment?.(t.content);
      }),
      Match.when({ _tag: "Doctype" }, (t) => {
        callbacks.onDoctype?.(t.content);
      }),
      Match.exhaustive
    );
  };

/**
 * Parse HTML and invoke callbacks for each token.
 * This is useful for streaming-style processing.
 *
 * @example
 * ```typescript
 * import { parseHtmlWithCallbacks } from "@beep/utils/sanitize-html/parser/html-parser"
 *
 * parseHtmlWithCallbacks("<div>Hello</div>", {
 *   onOpenTag: (name, attrs) => console.log("Open:", name),
 *   onText: (text) => console.log("Text:", text),
 *   onCloseTag: (name) => console.log("Close:", name),
 * })
 * ```
 *
 * @since 0.1.0
 * @category parsing
 */
export const parseHtmlWithCallbacks = (
  html: string,
  callbacks: {
    onOpenTag?: undefined | ((name: string, attributes: Attributes, selfClosing: boolean) => void);
    onCloseTag?: undefined | ((name: string) => void);
    onText?: undefined | ((content: string) => void);
    onComment?: undefined | ((content: string) => void);
    onDoctype?: undefined | ((content: string) => void);
  },
  options: ParserOptions = {}
): void => {
  const tokens = parseHtml(html, options);
  const handler = createTokenHandler(callbacks);

  A.forEach(tokens, handler);
};
