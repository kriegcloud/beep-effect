import "../setup/client-env.stub";

import { beforeEach, describe, expect, it, vi } from "bun:test";
import * as ToastModule from "@beep/ui/common";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { AuthHandler } from "../../src/auth-wrapper/handler";

const withToastSpy = vi.spyOn(ToastModule, "withToast");

describe("createAuthHandler", () => {
  beforeEach(() => {
    withToastSpy.mockReset();
    withToastSpy.mockImplementation;
  });

  it("returns an Effect handler", () => {
    const handler = AuthHandler.make({
      name: "demo",
      plugin: "test",
      method: "demo",
      run: async (_encoded, _signal) => ({ data: undefined }),
    });

    expect(handler).toBeInstanceOf(Function);
  });

  it("validates input via schema and swallows failures", async () => {
    const run = vi.fn(async () => ({ data: undefined }));

    const handler = AuthHandler.make({
      name: "schemaValidation",
      plugin: "auth",
      method: "sign-in",
      schema: S.Struct({ count: S.Number }),
      run,
    });

    // @ts-expect-error -- intentionally provide invalid input to trigger schema failure
    const result = await Effect.runPromise(handler({ count: "not-a-number" }));

    expect(result).toBeUndefined();
    expect(run).not.toHaveBeenCalled();
  });

  it("supports prepare step before invoking run", async () => {
    const run = vi.fn(async (value: string) => ({ data: value.length }));

    const handler = AuthHandler.make({
      name: "withPrepare",
      plugin: "auth",
      method: "prepare",
      prepare: () => Effect.succeed("encoded"),
      run,
    });

    const result = await Effect.runPromise(handler("source"));

    expect(result).toBeUndefined();
    expect(run).toHaveBeenCalledWith("encoded", expect.any(AbortSignal));
  });

  it("invokes onSuccess callback when run succeeds", async () => {
    const onSuccess = vi.fn(() => Effect.void);

    const handler = AuthHandler.make({
      name: "withSuccess",
      plugin: "auth",
      method: "success",
      run: async () => ({ data: "value" as const }),
      onSuccess,
    });

    await Effect.runPromise(handler(undefined));

    expect(onSuccess).toHaveBeenCalledWith("value", undefined);
  });

  it("decorates effect with toast options", async () => {
    const toastCapture: unknown[] = [];
    withToastSpy.mockImplementation((options) => {
      toastCapture.push(options);
      return (effect, ...args) => effect.pipe(Effect.tap(() => Effect.sync(() => toastCapture.push(args))));
    });

    const handler = AuthHandler.make({
      name: "withToast",
      plugin: "auth",
      method: "toast",
      toast: {
        defaults: {
          onWaiting: "Waiting",
          onSuccess: "Success",
          onFailure: {
            onNone: () => "Failure",
            onSome: (err) => (err as { message: string }).message,
          },
        },
      },
      run: async () => ({ data: undefined }),
    });

    await Effect.runPromise(handler(undefined));

    const options = toastCapture[0] as {
      onWaiting: string | ((...args: Array<unknown>) => string);
      onSuccess: string | ((value: unknown, ...args: Array<unknown>) => string);
      onFailure: string | ((error: O.Option<unknown>, ...args: Array<unknown>) => string);
    };

    expect(options.onWaiting).toBe("Waiting");
    expect(options.onSuccess).toBe("Success");
    expect(typeof options.onFailure).toBe("function");

    const failureWithNone = typeof options.onFailure === "string" ? options.onFailure : options.onFailure(O.none());
    expect(failureWithNone).toBe("Failure");

    const failureWithSome =
      typeof options.onFailure === "string" ? options.onFailure : options.onFailure(O.some({ message: "boom" }));
    expect(failureWithSome).toBe("boom");
  });

  it("swallows Better Auth failures and resolves void", async () => {
    const handler = AuthHandler.make({
      name: "swallowFailure",
      plugin: "auth",
      method: "failure",
      run: async () => ({
        error: {
          message: "boom",
          code: "UNEXPECTED",
        },
      }),
    });

    await expect(Effect.runPromise(handler(undefined))).resolves.toBeUndefined();
  });
});
