/**
 * Streaming text delta buffering helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SandboxId.create("TextDeltaBuffer");

const SENTENCE_BOUNDARY_PATTERN = /[.!?] $/;

/**
 * Configuration for {@link TextDeltaBuffer}.
 *
 * @example
 * ```ts
 * import { TextDeltaBufferOptions } from "@beep/sandbox"
 *
 * const options = new TextDeltaBufferOptions({
 *   debounceMs: 50,
 *   lengthThreshold: 80,
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextDeltaBufferOptions extends S.Class<TextDeltaBufferOptions>($I`TextDeltaBufferOptions`)(
  {
    debounceMs: S.Number,
    lengthThreshold: S.Number,
  },
  $I.annote("TextDeltaBufferOptions", {
    description: "Configuration for buffered streaming text flush behavior.",
  })
) {}

const defaultOptions = new TextDeltaBufferOptions({
  debounceMs: 50,
  lengthThreshold: 80,
});

/**
 * Callback invoked whenever buffered text is flushed.
 *
 * @category models
 * @since 0.0.0
 */
export type TextDeltaFlush = (text: string) => void;

/**
 * Buffers streaming text deltas into readable chunks.
 *
 * @example
 * ```ts
 * import { TextDeltaBuffer } from "@beep/sandbox"
 *
 * const flushed: Array<string> = []
 * const buffer = new TextDeltaBuffer((text) => flushed.push(text))
 *
 * buffer.write("Hello. ")
 * buffer.dispose()
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export class TextDeltaBuffer {
  readonly #onFlush: TextDeltaFlush;
  readonly #options: TextDeltaBufferOptions;
  #buffer = "";
  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor(onFlush: TextDeltaFlush, options: TextDeltaBufferOptions = defaultOptions) {
    this.#onFlush = onFlush;
    this.#options = options;
  }

  /**
   * Append a text delta and flush when a readability boundary is reached.
   *
   * @category combinators
   * @since 0.0.0
   */
  write(text: string): void {
    if (text.length === 0) {
      return;
    }

    this.#buffer += text;
    this.#clearTimer();

    if (this.#shouldFlush()) {
      this.#flushBuffer();
      return;
    }

    this.#timer = setTimeout(() => {
      this.#flushBuffer();
    }, this.#options.debounceMs);
  }

  /**
   * Force any buffered text to flush.
   *
   * @category combinators
   * @since 0.0.0
   */
  flush(): void {
    this.#clearTimer();
    this.#flushBuffer();
  }

  /**
   * Flush buffered text and cancel pending timers.
   *
   * @category destructors
   * @since 0.0.0
   */
  dispose(): void {
    this.flush();
  }

  #shouldFlush(): boolean {
    return (
      this.#buffer.includes("\n") ||
      SENTENCE_BOUNDARY_PATTERN.test(this.#buffer) ||
      this.#buffer.length >= this.#options.lengthThreshold
    );
  }

  #flushBuffer(): void {
    if (this.#buffer.length === 0) {
      return;
    }

    const text = this.#buffer;
    this.#buffer = "";
    this.#onFlush(text);
  }

  #clearTimer(): void {
    if (this.#timer !== undefined) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
    }
  }
}
