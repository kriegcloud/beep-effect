import * as Testkit from "@beep/testkit";

import * as WebError from "@beep/utils/browser/WebError.ts";

Testkit.describe("parseWebError", () => {
  Testkit.it("returns a WebError instance unchanged when no expectations are provided", () => {
    const domException = new DOMException("missing node", "NotFoundError");
    const webError = new WebError.NotFoundError({ cause: domException });

    const result = WebError.parseWebError(webError);

    Testkit.expect(result).toBeInstanceOf(WebError.NotFoundError);
    Testkit.expect(result.cause).toBe(domException);
  });

  Testkit.it("maps native errors to the corresponding WebError when expected", () => {
    const nativeError = new globalThis.TypeError("unsupported type");

    const result = WebError.parseWebError(nativeError, [WebError.TypeError]);

    Testkit.expect(result).toBeInstanceOf(WebError.TypeError);
    Testkit.expect(result.cause).toBe(nativeError);
  });

  Testkit.it("wraps parsed errors that are not in the expected list in UnknownError", () => {
    const nativeError = new globalThis.RangeError("value out of range");

    const result = WebError.parseWebError(nativeError, [WebError.TypeError]);

    Testkit.expect(result).toBeInstanceOf(WebError.UnknownError);
    Testkit.expect(result.cause).toBeInstanceOf(WebError.RangeError);
  });

  Testkit.it("translates DOMException names into the matching WebError variant", () => {
    const domException = new DOMException("permission denied", "NotAllowedError");

    const result = WebError.parseWebError(domException, [WebError.NotAllowedError]);

    Testkit.expect(result).toBeInstanceOf(WebError.NotAllowedError);
    Testkit.expect(result.cause).toBe(domException);
  });

  Testkit.it("produces UnknownError for non-error values with the default message", () => {
    const value = { reason: "unexpected" };

    const result = WebError.parseWebError(value);

    Testkit.expect(result).toBeInstanceOf(WebError.UnknownError);
    Testkit.expect(result.cause).toBeDefined();
    Testkit.expect(result.message).toBe("A web error occurred");
  });

  Testkit.it("returns UnknownError instances without altering their payload when expectations are provided", () => {
    const existing = new WebError.UnknownError({ description: "pre-parsed" });

    const result = WebError.parseWebError(existing, [WebError.TypeError]);

    Testkit.expect(result).toBeInstanceOf(WebError.UnknownError);

    if (!(result instanceof WebError.UnknownError)) {
      throw new Error("Expected an UnknownError instance");
    }

    Testkit.expect(result.description).toBe("pre-parsed");
  });
});
