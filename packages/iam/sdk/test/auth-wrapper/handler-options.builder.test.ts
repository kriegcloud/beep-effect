import "../setup/client-env.stub";

import { describe, expect, it } from "bun:test";
import * as Duration from "effect/Duration";
import {
  buildHandlerOptions,
  withAnnotations,
  withFiberContext,
  withRetryOptions,
  withTracing,
} from "../../src/auth-wrapper/config";

describe("handler options builder", () => {
  it("returns default options when input is undefined", () => {
    const options = buildHandlerOptions();

    expect(options.tracing).toBe("traced");
    expect(options.retry).toBeUndefined();
  });

  it("clones nested option structures", () => {
    const retry = {
      maxAttempts: 3,
      baseDelay: "250 millis" as const,
    };

    const timeout = {
      duration: "2 seconds" as const,
    };

    const annotations = { userId: "user-123" } as const;
    const fiberContext = {
      annotations: { requestId: "req-1" } as const,
      metricTags: { region: "us-east" } as const,
    };

    const options = buildHandlerOptions({ retry, timeout, annotations, fiberContext });

    expect(options.retry).not.toBeUndefined();
    expect(options.retry).not.toBe(retry);
    expect(options.retry?.maxAttempts).toBe(3);

    expect(options.timeout).not.toBe(timeout);
    expect(options.timeout?.duration).toStrictEqual(Duration.decode("2 seconds"));

    expect(options.annotations).not.toBe(annotations);
    expect(options.annotations?.userId).toBe("user-123");

    expect(options.fiberContext).not.toBe(fiberContext);
    expect(options.fiberContext?.annotations).toStrictEqual(fiberContext.annotations);
    expect(options.fiberContext?.annotations?.requestId).toBe("req-1");
    expect(options.fiberContext?.metricTags).toStrictEqual(fiberContext.metricTags);
    expect(options.fiberContext?.metricTags?.region).toBe("us-east");
  });

  it("merges helper overrides", () => {
    const options = withRetryOptions({ maxAttempts: 2 }, withTracing("untraced"), withAnnotations({ flow: "primary" }));

    expect(options.retry?.maxAttempts).toBe(2);
    expect(options.tracing).toBe("traced");
    expect(options.annotations?.flow).toBe("primary");
  });

  it("supports fiber context helpers", () => {
    const options = withFiberContext({ annotations: { user: "42" } });

    expect(options.fiberContext?.annotations?.user).toBe("42");
    expect(options.tracing).toBe("traced");
  });
});
