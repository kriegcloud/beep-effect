import { isWindowUndefined, randomHexString } from "@beep/utils";
import { UploadError } from "./error";

export function guardServerOnly() {
  if (isWindowUndefined) {
    throw new UploadError({
      code: "NOT_AVAILABLE_IN_BROWSER",
      message: "This function is not available in the browser",
    });
  }
}

export type TraceHeaders = {
  readonly b3: string;
  readonly traceparent: string;
};

export const generateTraceHeaders = (): TraceHeaders => {
  const traceId = randomHexString(32);
  const spanId = randomHexString(16);
  const sampled = "01";

  return {
    b3: `${traceId}-${spanId}-${sampled}`,
    traceparent: `00-${traceId}-${spanId}-${sampled}`,
  } as const;
};
