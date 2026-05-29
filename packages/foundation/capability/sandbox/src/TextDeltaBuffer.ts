/**
 * Streaming text delta buffering helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Str } from "@beep/utils";
import { Effect } from "effect";
import * as S from "effect/Schema";
import type { Fiber } from "effect";

const $I = $SandboxId.create("TextDeltaBuffer");

const SENTENCE_BOUNDARY_PATTERN = /[.!?] $/;

/**
 * Configuration for {@link TextDeltaBuffer}.
 *
 * @example
 * ```ts
 * import { TextDeltaBufferOptions } from "@beep/sandbox"
 *
 * const options = TextDeltaBufferOptions.make({
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

const defaultOptions = TextDeltaBufferOptions.make({
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
 * import { A } from "@beep/utils"
 *
 * const flushed: Array<string> = []
 * const buffer = new TextDeltaBuffer((text) => A.appendInPlace(flushed, text))
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
  #timer: Fiber.Fiber<void> | undefined;

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

    this.#timer = Effect.runFork(
      Effect.sleep(this.#options.debounceMs).pipe(
        Effect.andThen(
          Effect.sync(() => {
            this.#timer = undefined;
            this.#flushBuffer();
          })
        )
      )
    );
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
      Str.includes("\n")(this.#buffer) ||
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
      this.#timer.interruptUnsafe();
      this.#timer = undefined;
    }
  }
}
