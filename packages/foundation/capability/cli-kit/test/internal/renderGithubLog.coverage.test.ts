import { Doc } from "@beep/cli-kit/Doc";
import { renderGithubLog } from "@beep/cli-kit/internal/renderGithubLog";
import { Render } from "@beep/cli-kit/Render";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("untitled sections keep trusted annotations and neutralize untrusted text", () =>
  Effect.sync(() => {
    const ctx = Render.contextOf({ audience: "agent" });
    assert.strictEqual(
      renderGithubLog(
        [Doc.section(undefined, [Doc.annotation({ level: "notice" }, "ok"), Doc.paragraph("::error::untrusted")])],
        ctx
      ),
      "::notice::ok\n\n\u200b::error::untrusted"
    );
  })
);
