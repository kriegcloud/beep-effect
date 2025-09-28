import type { Draft } from "mutative";
import { create } from "mutative";

import type {
  HandlerFiberContextOptions,
  HandlerMetricsOptions,
  HandlerOptionsShape,
  HandlerRetryOptions,
  HandlerTimeoutOptions,
} from "./handler-options.schema";

const hasOwn = <Key extends PropertyKey>(value: object, key: Key): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const mergeRecord = <Value>(
  base: Readonly<Record<string, Value>> | undefined,
  patch: Readonly<Record<string, Value>>
): Readonly<Record<string, Value>> => {
  if (!base) {
    return create({ ...patch }, () => {});
  }

  return create(base, (draft) => {
    Object.assign(draft as Record<string, Value>, patch);
  });
};

const mergeRetryOptions = (base: HandlerRetryOptions | undefined, patch: HandlerRetryOptions): HandlerRetryOptions => {
  if (!base) {
    return create({ ...patch }, () => {});
  }

  return create(base, (draft) => {
    Object.assign(draft, patch);
  });
};

const mergeTimeoutOptions = (
  base: HandlerTimeoutOptions | undefined,
  patch: HandlerTimeoutOptions
): HandlerTimeoutOptions => {
  if (!base) {
    return create({ ...patch }, () => {});
  }

  return create(base, (draft) => {
    Object.assign(draft, patch);
  });
};

const mergeMetricsOptions = (
  base: HandlerMetricsOptions | undefined,
  patch: HandlerMetricsOptions
): HandlerMetricsOptions => {
  if (!base) {
    return create({ ...patch }, () => {});
  }

  return create(base, (draft) => {
    Object.assign(draft, patch);
  });
};

const mergeFiberContext = (
  base: HandlerFiberContextOptions | undefined,
  patch: HandlerFiberContextOptions
): HandlerFiberContextOptions => {
  const initial = base ? base : { ...patch };

  return create(initial, (draft) => {
    if (patch.annotations !== undefined) {
      draft.annotations = mergeRecord(draft.annotations, patch.annotations) as Draft<
        HandlerFiberContextOptions["annotations"]
      >;
    }

    if (patch.metricTags !== undefined) {
      draft.metricTags = mergeRecord(draft.metricTags, patch.metricTags) as Draft<
        HandlerFiberContextOptions["metricTags"]
      >;
    }
  });
};

const mergePair = (base: HandlerOptionsShape, patch: HandlerOptionsShape): HandlerOptionsShape =>
  create(base, (draft) => {
    if (hasOwn(patch, "retry")) {
      draft.retry =
        patch.retry === undefined
          ? undefined
          : (mergeRetryOptions(draft.retry, patch.retry) as Draft<HandlerRetryOptions>);
    }

    if (hasOwn(patch, "timeout")) {
      draft.timeout =
        patch.timeout === undefined
          ? undefined
          : (mergeTimeoutOptions(draft.timeout, patch.timeout) as Draft<HandlerTimeoutOptions>);
    }

    if (hasOwn(patch, "metrics")) {
      draft.metrics =
        patch.metrics === undefined
          ? undefined
          : (mergeMetricsOptions(draft.metrics, patch.metrics) as Draft<HandlerMetricsOptions>);
    }

    if (hasOwn(patch, "annotations")) {
      draft.annotations =
        patch.annotations === undefined
          ? undefined
          : (mergeRecord(draft.annotations, patch.annotations) as Draft<HandlerOptionsShape["annotations"]>);
    }

    if (hasOwn(patch, "tracing")) {
      draft.tracing = patch.tracing;
    }

    if (hasOwn(patch, "semaphoreKey")) {
      draft.semaphoreKey = patch.semaphoreKey;
    }

    if (hasOwn(patch, "fiberContext")) {
      draft.fiberContext =
        patch.fiberContext === undefined
          ? undefined
          : (mergeFiberContext(draft.fiberContext, patch.fiberContext) as Draft<HandlerFiberContextOptions>);
    }
  });

export const mergeHandlerOptions = (
  ...options: ReadonlyArray<HandlerOptionsShape | undefined>
): HandlerOptionsShape => {
  let merged: HandlerOptionsShape = {};

  for (const option of options) {
    if (!option) {
      continue;
    }

    merged = mergePair(merged, option);
  }

  return merged;
};
