import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const runs = { arbitrary: fcRuns(100) };

import { Doc } from "@beep/cli-kit/Doc";
import { sanitize } from "@beep/cli-kit/Fmt";
import { renderAnsi } from "@beep/cli-kit/internal/renderAnsi";
import { Render } from "@beep/cli-kit/Render";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Str from "effect/String";

const ctx = Render.contextOf({ audience: "agent", color: "none" });
it.effect.prop(
  "ANSI renderer in an escape-free context is idempotent and its line parser preserves sanitized verbatim bytes",
  [Arbitrary.schema(S.String)],
  ([text]) =>
    Effect.sync(() => {
      const input = `prefix ${text} suffix`;
      const rendered = renderAnsi([Doc.verbatim(input)], ctx);
      assert.strictEqual(
        rendered,
        pipe(input, Str.replace(/\r\n|\r/g, "\n"), Str.split("\n"), A.map(sanitize), A.join("\n"))
      );
      assert.strictEqual(renderAnsi([Doc.verbatim(rendered)], ctx), rendered);
      const parsed = Str.split(rendered, "\n");
      assert.deepStrictEqual(Str.split(renderAnsi([Doc.verbatim(A.join(parsed, "\n"))], ctx), "\n"), parsed);
    }),
  runs
);
it.effect.prop(
  "link labels retain their target suffix when terminal hyperlinks are unavailable",
  [Arbitrary.schema(S.String)],
  ([text]) =>
    Effect.sync(() => {
      const label = `label ${Str.replace(/\r|\n/g, " ")(sanitize(text))} end`;
      const target = "https://example.com/details";
      const rendered = renderAnsi([Doc.paragraph(Doc.link({ url: target }, label))], ctx);
      assert.strictEqual(rendered, `${label} (${target})`);
      assert.strictEqual(renderAnsi([Doc.verbatim(rendered)], ctx), rendered);
    }),
  runs
);

it.effect.prop(
  "painted human output preserves plain content and formatting stabilizes after parsing the paint",
  [Arbitrary.schema(S.String), Arbitrary.schema(S.Literals(["basic", "256", "truecolor"]))],
  ([text, color]) =>
    Effect.sync(() => {
      const safe = `prefix ${Str.replace(/[\r\n]/g, " ")(sanitize(text))} suffix`;
      const human = Render.contextOf({ audience: "human", color });
      const document = (value: string) => [Doc.paragraph(Doc.strong(Doc.text(value, "accent")))];
      const painted = renderAnsi(document(safe), human);
      const parsed = sanitize(painted);
      assert.strictEqual(parsed, safe);
      assert.strictEqual(renderAnsi(document(parsed), human), painted);
      assert.strictEqual(sanitize(renderAnsi(document(parsed), human)), parsed);
      const agent = Render.contextOf({ audience: "agent", color });
      assert.strictEqual(renderAnsi(document(safe), agent), safe);
    }),
  runs
);
