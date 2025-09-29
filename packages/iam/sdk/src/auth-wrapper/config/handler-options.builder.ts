import * as Duration from "effect/Duration";
import type { Draft } from "mutative";
import { create } from "mutative";
import { mergeWithDefaultHandlerOptions } from "./defaults";
import type {
  HandlerFiberContextOptions,
  HandlerMetricsOptions,
  HandlerOptionsShape,
  HandlerRetryOptions,
  HandlerTimeoutOptions,
} from "./handler-options.schema";
import { mergeHandlerOptions } from "./merge-handler-options";

export interface HandlerOptionsBuilderInput {
  readonly retry?: HandlerRetryOptions;
  readonly timeout?: HandlerTimeoutOptions;
  readonly metrics?: HandlerMetricsOptions;
  readonly annotations?: Readonly<Record<string, unknown>>;
  readonly tracing?: "traced" | "untraced";
  readonly semaphoreKey?: string;
  readonly fiberContext?: HandlerFiberContextOptions;
}

const cloneRecord = <Value>(
  record: Readonly<Record<string, Value>> | undefined
): Readonly<Record<string, Value>> | undefined => (record ? create(record, () => {}) : undefined);

const cloneFiberContext = (
  fiberContext: HandlerFiberContextOptions | undefined
): HandlerFiberContextOptions | undefined =>
  fiberContext
    ? create(fiberContext, (draft) => {
        if (draft.annotations) {
          draft.annotations = cloneRecord(draft.annotations);
        }

        if (draft.metricTags) {
          draft.metricTags = cloneRecord(draft.metricTags);
        }
      })
    : undefined;

const cloneDurationInput = (value: Duration.DurationInput | undefined) => {
  if (!value) {
    return value;
  }

  return Duration.decode(value);
};

const cloneRetryOptions = (retry: HandlerRetryOptions): HandlerRetryOptions =>
  create(retry, (draft) => {
    if (draft.baseDelay !== undefined) {
      draft.baseDelay = Duration.decode(draft.baseDelay);
    }
  });

const cloneTimeoutOptions = (timeout: HandlerTimeoutOptions): HandlerTimeoutOptions =>
  create(timeout, (draft) => {
    draft.duration = cloneDurationInput(Duration.decode(draft.duration))!;
  });

const normalizeHandlerOptions = (input: HandlerOptionsBuilderInput | undefined): HandlerOptionsShape => {
  if (!input) {
    return mergeHandlerOptions();
  }

  return create(mergeHandlerOptions(), (draft) => {
    if (input.retry) {
      draft.retry = cloneRetryOptions(input.retry) as Draft<HandlerRetryOptions>;
    }

    if (input.timeout) {
      draft.timeout = cloneTimeoutOptions(input.timeout) as Draft<HandlerTimeoutOptions>;
    }

    if (input.metrics) {
      draft.metrics = create(input.metrics, () => {}) as Draft<HandlerMetricsOptions>;
    }

    if (input.annotations) {
      draft.annotations = cloneRecord(input.annotations) as Draft<HandlerOptionsShape["annotations"]>;
    }

    if (input.tracing !== undefined) {
      draft.tracing = input.tracing;
    }

    if (input.semaphoreKey !== undefined) {
      draft.semaphoreKey = input.semaphoreKey;
    }

    const fiberContext = cloneFiberContext(input.fiberContext);
    if (fiberContext !== undefined) {
      draft.fiberContext = fiberContext as Draft<HandlerFiberContextOptions>;
    }
  });
};

export const buildHandlerOptions = (
  input?: HandlerOptionsBuilderInput,
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => mergeWithDefaultHandlerOptions(normalizeHandlerOptions(input), ...overrides);

export const withRetryOptions = (
  retry: HandlerRetryOptions,
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => buildHandlerOptions({ retry }, ...overrides);

export const withTimeoutOptions = (
  timeout: HandlerTimeoutOptions,
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => buildHandlerOptions({ timeout }, ...overrides);

export const withMetricsOptions = (
  metrics: HandlerMetricsOptions,
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => buildHandlerOptions({ metrics }, ...overrides);

export const withAnnotations = (
  annotations: Readonly<Record<string, unknown>>,
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => buildHandlerOptions({ annotations }, ...overrides);

export const withFiberContext = (
  fiberContext: HandlerFiberContextOptions,
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => buildHandlerOptions({ fiberContext }, ...overrides);

export const withTracing = (
  tracing: "traced" | "untraced",
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => buildHandlerOptions({ tracing }, ...overrides);

export const withSemaphoreKey = (
  semaphoreKey: string,
  ...overrides: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => buildHandlerOptions({ semaphoreKey }, ...overrides);
