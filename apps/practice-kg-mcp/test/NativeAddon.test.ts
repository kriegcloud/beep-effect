import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertNone } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { executableDirectory, isNativeAddonRequest, resolveNativeAddon } from "../src/NativeAddon.ts";

const addon = "@duckdb/node-bindings-win32-x64/duckdb.node";

// A resolver over a fake disk: only `<directory>node_modules/<specifier>` files listed in `present` exist.
const fakeResolver =
  (present: ReadonlyArray<string>, seen: Array<string>) => (specifier: string, directory: string) => {
    seen.push(directory);
    const candidate = `${directory}node_modules/${specifier}`;
    if (A.contains(present, candidate)) {
      return candidate;
    }
    throw new Error(`Cannot find module '${specifier}' from '${directory}'`);
  };

describe("NativeAddon", () => {
  it("recognises only DuckDB native addon requests", () => {
    expect(isNativeAddonRequest(addon)).toBe(true);
    expect(isNativeAddonRequest("@duckdb/node-api")).toBe(false);
    expect(isNativeAddonRequest("effect/Effect")).toBe(false);
  });

  it("takes the executable folder from Windows and POSIX paths", () => {
    expect(executableDirectory("C:\\Users\\tom\\Ext\\practice-kg-mcp.exe")).toBe("C:\\Users\\tom\\Ext\\");
    expect(executableDirectory("/opt/ext/practice-kg-mcp")).toBe("/opt/ext/");
    expect(executableDirectory("practice-kg-mcp")).toBe(".");
  });

  it("resolves from the executable folder, never the working directory", () => {
    const cwd = process.cwd();
    const seen: Array<string> = [];
    const resolved = resolveNativeAddon(
      addon,
      "/opt/ext/practice-kg-mcp",
      // The addon also exists under the working directory; the resolver must not look there.
      fakeResolver([`/opt/ext/node_modules/${addon}`, `${cwd}/node_modules/${addon}`], seen)
    );
    expect(O.getOrNull(resolved)).toBe(`/opt/ext/node_modules/${addon}`);
    expect(seen).toEqual(["/opt/ext/"]);
  });

  it("falls back (None) when the addon is not beside the executable, even if the cwd holds it", () => {
    const cwd = process.cwd();
    const seen: Array<string> = [];
    assertNone(
      resolveNativeAddon(addon, "/opt/ext/practice-kg-mcp", fakeResolver([`${cwd}/node_modules/${addon}`], seen))
    );
    expect(seen).toEqual(["/opt/ext/"]);
  });

  it("leaves other requests to the default resolution", () => {
    const seen: Array<string> = [];
    assertNone(resolveNativeAddon("effect/Effect", "/opt/ext/practice-kg-mcp", fakeResolver([], seen)));
    expect(seen).toEqual([]);
  });
});
