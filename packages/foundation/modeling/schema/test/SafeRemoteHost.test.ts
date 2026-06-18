import { assertAllowedRemoteHost, isBlockedRemoteHost } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("SafeRemoteHost", () => {
  it("classifies literal loopback, link-local, RFC1918/ULA, and metadata hosts", () => {
    expect(isBlockedRemoteHost("127.0.0.1")).toBe(true);
    expect(isBlockedRemoteHost("169.254.169.254")).toBe(true);
    expect(isBlockedRemoteHost("10.0.0.5")).toBe(true);
    expect(isBlockedRemoteHost("192.168.1.1")).toBe(true);
    expect(isBlockedRemoteHost("172.16.0.1")).toBe(true);
    expect(isBlockedRemoteHost("172.32.0.1")).toBe(false);
    expect(isBlockedRemoteHost("example.com")).toBe(false);
  });

  it.effect(
    "rejects a public hostname that resolves to an internal address when a resolver is supplied (CSF-006)",
    Effect.fnUntraced(function* () {
      const exit = yield* Effect.exit(
        assertAllowedRemoteHost("internal.example.com", {
          resolve: () => Effect.succeed(["93.184.216.34", "169.254.169.254"]),
        })
      );
      expect(exit._tag).toBe("Failure");
    })
  );

  it.effect(
    "allows a public hostname that resolves only to public addresses",
    Effect.fnUntraced(function* () {
      const exit = yield* Effect.exit(
        assertAllowedRemoteHost("example.com", { resolve: () => Effect.succeed(["93.184.216.34"]) })
      );
      expect(exit._tag).toBe("Success");
    })
  );

  it.effect(
    "stays back-compatible: with no resolver only the literal host is classified",
    Effect.fnUntraced(function* () {
      const blocked = yield* Effect.exit(assertAllowedRemoteHost("169.254.169.254"));
      expect(blocked._tag).toBe("Failure");
      const allowed = yield* Effect.exit(assertAllowedRemoteHost("example.com"));
      expect(allowed._tag).toBe("Success");
    })
  );
});
