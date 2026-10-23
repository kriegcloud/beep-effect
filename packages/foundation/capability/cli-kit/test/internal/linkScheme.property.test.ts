import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const runs = { arbitrary: fcRuns(100) };

import { isAllowedLinkUrl } from "@beep/cli-kit/internal/linkScheme";
import * as Str from "effect/String";

it.effect.prop(
  "URL scheme parsing is stable under case folding and refuses obfuscated executable schemes",
  [
    Arbitrary.schema(S.String),
    Arbitrary.schema(S.Literals(["http", "https", "mailto", "file", "vscode", "vscode-insiders"])),
  ],
  ([path, scheme]) =>
    Effect.sync(() => {
      assert.strictEqual(isAllowedLinkUrl(`${Str.toUpperCase(scheme)}:${path}`), true);
      assert.strictEqual(isAllowedLinkUrl(`j\ta v\na s\rc r i p t:${path}`), false);
      assert.strictEqual(isAllowedLinkUrl(Str.toLowerCase(`${scheme}:${path}`)), isAllowedLinkUrl(`${scheme}:${path}`));
    }),
  runs
);
