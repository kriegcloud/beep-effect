import * as Path from "node:path";
import { fileURLToPath } from "node:url";
import { formatCauseHeading } from "@beep/utils/errors";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "@effect/vitest/utils";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";

function boomMaker(): Error {
  return new Error("boom");
}

describe("errors/formatCauseHeading", () => {
  it("renders heading with path, file, time, function and metadata", () =>
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

      deepStrictEqual(heading.includes(`🗂 Path: ${relPath}`), true);
      deepStrictEqual(heading.includes(`📄 File: ${fileName}`), true);
      deepStrictEqual(heading.includes("🕒 Time: 1970-01-01"), true);
      deepStrictEqual(heading.includes("🔧 Function: boomMaker"), true);
      deepStrictEqual(heading.includes("🧪 Type: Error"), true);
      deepStrictEqual(heading.includes("🧰 Service: utils"), true);
      deepStrictEqual(heading.includes("🌱 Env: test"), true);
      deepStrictEqual(heading.includes("🔎 Code:"), true);
      deepStrictEqual(heading.includes("💬 Message: boom"), true);
    }));
});
