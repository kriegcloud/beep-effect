import { describe, expect } from "bun:test";
import * as Path from "node:path";
import { fileURLToPath } from "node:url";
import { formatCauseHeading } from "@beep/errors/server";
import { effect } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";

function boomMaker(): Error {
  return new Error("boom");
}

describe("errors/formatCauseHeading", () => {
  effect("renders heading with path, file, time, function and metadata", () =>
    Effect.sync(() => {
      const err = boomMaker();
      const cause = Cause.fail(err);
      const heading = formatCauseHeading(cause, {
        colors: false,
        date: new Date(0),
        levelLabel: "ERROR",
        service: "utils",
        environment: "test",
        includeCodeFrame: true,
      });
      const filePath = fileURLToPath(import.meta.url);
      const fileName = Path.basename(filePath);
      const relPath = Path.relative(process.cwd(), filePath).replace(/\\/g, "/");

      expect(heading.includes(`🗂 Path: ${relPath}`)).toEqual(true);
      expect(heading.includes(`📄 File: ${fileName}`)).toEqual(true);
      expect(heading.includes("🕒 Time: 1970-01-01")).toEqual(true);
      expect(heading.includes("🔧 Function: boomMaker")).toEqual(true);
      expect(heading.includes("🧪 Type: Error")).toEqual(true);
      expect(heading.includes("🧰 Service: utils")).toEqual(true);
      expect(heading.includes("🌱 Env: test")).toEqual(true);
      expect(heading.includes("🔎 Code:")).toEqual(true);
      expect(heading.includes("💬 Message: boom")).toEqual(true);
    })
  );
});
