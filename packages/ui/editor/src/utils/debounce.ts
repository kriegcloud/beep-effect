import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";

/**
 * Edge type for debounce timing control.
 */
export type DebounceEdge = "leading" | "trailing";

/**
 * Options for the debounce function.
 */
export interface DebounceOptions {
  /**
   * An optional AbortSignal to cancel the debounced function.
   */
  readonly signal?: AbortSignal;

  /**
   * An optional array specifying whether the function should be invoked on the leading edge, trailing edge, or both.
   * If `edges` includes "leading", the function will be invoked at the start of the delay period.
   * If `edges` includes "trailing", the function will be invoked at the end of the delay period.
   * If both "leading" and "trailing" are included, the function will be invoked at both the start and end of the delay period.
   * @default ["trailing"]
   */
  readonly edges?: ReadonlyArray<DebounceEdge>;

  /**
   * The maximum time the function can be delayed before it's invoked.
   * This ensures the function is called at least once within this time window,
   * even if the debounced function keeps being called.
   */
  readonly maxWait?: Duration.DurationInput;
}

/**
 * A debounced function with additional control methods.
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for function parameter contravariance
export interface DebouncedFunction<F extends (...args: any[]) => void> {
  (...args: Parameters<F>): void;

  /**
   * Schedules the execution of the debounced function after the specified debounce delay.
   * This method resets any existing timer, ensuring that the function is only invoked
   * after the delay has elapsed since the last call to the debounced function.
   * It is typically called internally whenever the debounced function is invoked.
   *
   * @returns {void}
   */
  readonly schedule: () => void;

  /**
   * Cancels any pending execution of the debounced function.
   * This method clears the active timer and resets any stored context or arguments.
   */
  readonly cancel: () => void;

  /**
   * Immediately invokes the debounced function if there is a pending execution.
   * This method executes the function right away if there is a pending execution.
   */
  readonly flush: () => void;
}

/**
 * Default edges for debounce - trailing only.
 */
const DEFAULT_EDGES: ReadonlyArray<DebounceEdge> = ["trailing"];

/**
 * Checks if edges include a specific edge type.
 */
const hasEdge = (edges: O.Option<ReadonlyArray<DebounceEdge>>, edge: DebounceEdge): boolean =>
  F.pipe(
    edges,
    O.getOrElse(() => DEFAULT_EDGES),
    A.contains(edge)
  );

/**
 * Creates a debounced function that delays invoking the provided function until after `debounceMs` milliseconds
 * have elapsed since the last time the debounced function was invoked. The debounced function also has a `cancel`
 * method to cancel any pending execution.
 *
 * This function is dual, meaning it can be used in both data-first and data-last (pipeable) styles.
 *
 * @example
 * ```ts
 * import { debounce } from "./debounce";
 * import { pipe } from "effect/Function";
 * import * as Duration from "effect/Duration";
 *
 * // Data-first style
 * const debouncedFn = debounce(
 *   () => console.log("executed"),
 *   Duration.seconds(1)
 * );
 *
 * // Data-last (pipeable) style
 * const debouncedFn2 = pipe(
 *   () => console.log("executed"),
 *   debounce(Duration.seconds(1))
 * );
 *
 * // With options
 * const debouncedFn3 = debounce(
 *   () => console.log("executed"),
 *   "1 seconds",
 *   { edges: ["leading", "trailing"] }
 * );
 *
 * // With AbortSignal
 * const controller = new AbortController();
 * const debouncedWithSignal = debounce(
 *   () => console.log("executed"),
 *   1000,
 *   { signal: controller.signal }
 * );
 *
 * debouncedWithSignal();
 * controller.abort(); // Cancels the debounced function
 *
 * // With maxWait - ensures function fires at least once within maxWait period
 * const debouncedWithMaxWait = debounce(
 *   () => console.log("executed"),
 *   Duration.millis(300),
 *   { maxWait: Duration.seconds(1) }
 * );
 * ```
 *
 * @since 1.0.0
 */
export const debounce: {
  // Data-last overload (pipeable)
  // biome-ignore lint/suspicious/noExplicitAny: Required for function parameter contravariance
  <F extends (...args: any[]) => void>(
    delay: Duration.DurationInput,
    options?: DebounceOptions
  ): (func: F) => DebouncedFunction<F>;

  // Data-first overload
  // biome-ignore lint/suspicious/noExplicitAny: Required for function parameter contravariance
  <F extends (...args: any[]) => void>(
    func: F,
    delay: Duration.DurationInput,
    options?: DebounceOptions
  ): DebouncedFunction<F>;
} = F.dual(
  (args) => P.isFunction(args[0]),
  // biome-ignore lint/suspicious/noExplicitAny: Required for function parameter contravariance
  <F extends (...args: any[]) => void>(
    func: F,
    delay: Duration.DurationInput,
    options?: DebounceOptions
  ): DebouncedFunction<F> => {
    const delayMs = Duration.toMillis(delay);
    const optionsOpt = O.fromNullable(options);
    const signalOpt = F.pipe(
      optionsOpt,
      O.flatMap((opts) => O.fromNullable(opts.signal))
    );
    const edgesOpt = F.pipe(
      optionsOpt,
      O.flatMap((opts) => O.fromNullable(opts.edges))
    );
    const maxWaitOpt = F.pipe(
      optionsOpt,
      O.flatMap((opts) => O.fromNullable(opts.maxWait)),
      O.map(Duration.toMillis)
    );

    const leading = hasEdge(edgesOpt, "leading");
    const trailing = F.pipe(
      edgesOpt,
      O.match({
        // Default to trailing when edges is not specified
        onNone: () => true,
        // Check if trailing is included when edges is specified
        onSome: (edges) => A.contains(edges, "trailing"),
      })
    );

    // Mutable state wrapped in Option for null-safety
    let pendingThis = O.none<unknown>();
    let pendingArgs: O.Option<Parameters<F>> = O.none<Parameters<F>>();
    let timeoutId = O.none<ReturnType<typeof setTimeout>>();
    let maxWaitTimeoutId = O.none<ReturnType<typeof setTimeout>>();
    // Store last args/this for trailing invocation (kept separate from pending state)
    let lastArgsForTrailing: O.Option<Parameters<F>> = O.none<Parameters<F>>();
    let lastThisForTrailing = O.none<unknown>();

    const invoke = (): void => {
      if (O.isSome(pendingArgs)) {
        const args = pendingArgs.value;
        const thisArg = O.getOrUndefined(pendingThis);

        // Use Function.apply pattern - we need to call func with proper this context
        // Since F.apply doesn't support this binding, we use a closure approach
        F.pipe(args, (a) => func.call(thisArg, ...a));

        pendingThis = O.none();
        pendingArgs = O.none();
      }
    };

    const invokeTrailing = (): void => {
      if (O.isSome(lastArgsForTrailing)) {
        const args = lastArgsForTrailing.value;
        const thisArg = O.getOrUndefined(lastThisForTrailing);

        F.pipe(args, (a) => func.call(thisArg, ...a));

        lastArgsForTrailing = O.none();
        lastThisForTrailing = O.none();
      }
    };

    const cancelMaxWaitTimer = (): void => {
      if (O.isSome(maxWaitTimeoutId)) {
        clearTimeout(maxWaitTimeoutId.value);
        maxWaitTimeoutId = O.none();
      }
    };

    const onTimerEnd = (): void => {
      cancelMaxWaitTimer();
      if (trailing) {
        // Use invokeTrailing which has the stored args (not cleared by leading)
        invokeTrailing();
      }
      cancel();
    };

    const onMaxWaitEnd = (): void => {
      maxWaitTimeoutId = O.none();
      // Force invoke and reset the debounce timer
      cancelTimer();
      invoke();
    };

    const cancelTimer = (): void => {
      if (O.isSome(timeoutId)) {
        clearTimeout(timeoutId.value);
        timeoutId = O.none();
      }
    };

    const schedule = (): void => {
      cancelTimer();

      timeoutId = O.some(
        setTimeout(() => {
          timeoutId = O.none();
          onTimerEnd();
        }, delayMs)
      );
    };

    const scheduleMaxWait = (): void => {
      // Only schedule maxWait timer if maxWait is specified and no maxWait timer is running
      if (O.isSome(maxWaitOpt) && O.isNone(maxWaitTimeoutId)) {
        const maxWaitMs = maxWaitOpt.value;
        maxWaitTimeoutId = O.some(
          setTimeout(() => {
            onMaxWaitEnd();
          }, maxWaitMs)
        );
      }
    };

    const cancel = (): void => {
      cancelTimer();
      cancelMaxWaitTimer();
      pendingThis = O.none();
      pendingArgs = O.none();
      lastArgsForTrailing = O.none();
      lastThisForTrailing = O.none();
    };

    const flush = (): void => {
      cancelTimer();
      cancelMaxWaitTimer();
      invoke();
    };

    const debounced = function (this: unknown, ...args: Parameters<F>): void {
      // Check if signal is aborted
      const isAborted = F.pipe(
        signalOpt,
        O.map((signal) => signal.aborted),
        O.getOrElse(() => false)
      );

      if (isAborted) {
        return;
      }

      pendingThis = O.some(this);
      pendingArgs = O.some(args);
      // Always store for trailing invocation (not cleared by leading invoke)
      lastThisForTrailing = O.some(this);
      lastArgsForTrailing = O.some(args);

      const isFirstCall = O.isNone(timeoutId);

      schedule();
      scheduleMaxWait();

      if (leading && isFirstCall) {
        invoke();
      }
    };

    debounced.schedule = schedule;
    debounced.cancel = cancel;
    debounced.flush = flush;

    // Register abort handler
    if (O.isSome(signalOpt)) {
      signalOpt.value.addEventListener("abort", cancel, { once: true });
    }

    return debounced;
  }
);
