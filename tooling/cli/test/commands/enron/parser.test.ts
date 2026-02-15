import { describe, effect, expect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Path from "node:path";
import { makeDeterministicEmailId, normalizeEmailBody, parseEmail } from "@beep/repo-cli/commands/enron/parser";

const fixturePath = (name: string) => Path.join(import.meta.dir, "fixtures", name);
const readFixture = (name: string): Effect.Effect<string> => Effect.promise(() => Bun.file(fixturePath(name)).text());

describe("enron/parser", () => {
  effect("parses required headers from a well-formed RFC 2822 email", () =>
    Effect.gen(function* () {
      const raw = yield* readFixture("simple-email.eml");
      const parsed = yield* parseEmail(raw, { folder: "allen-p/inbox", user: "allen-p" });

      strictEqual(parsed.from, "john.arnold@enron.com");
      expect(parsed.to).toContain("jane.doe@enron.com");
      expect(parsed.cc).toContain("risk.team@enron.com");
      expect(parsed.bcc).toContain("ops.audit@enron.com");
      strictEqual(parsed.subject, "Daily Position Update");
      strictEqual(parsed.messageId, "<simple-001@enron.com>");
      strictEqual(parsed.folder, "allen-p/inbox");
      strictEqual(parsed.user, "allen-p");
      expect(parsed.body).not.toContain("Vice President, Trading");
    })
  );

  effect("handles multipart MIME + quoted-printable and strips quoted replies", () =>
    Effect.gen(function* () {
      const raw = yield* readFixture("multipart-email.eml");
      const parsed = yield* parseEmail(raw, { folder: "allen-p/sent", user: "allen-p" });

      strictEqual(parsed.messageId, "<reply-002@enron.com>");
      strictEqual(parsed.inReplyTo, "<simple-001@enron.com>");
      expect(parsed.references).toEqual(["<simple-001@enron.com>"]);
      expect(parsed.body).toContain("I updated the risk notes");
      expect(parsed.body).not.toContain("On Mon, 04 Dec 2000");
      expect(parsed.body).not.toContain("> Please review");
    })
  );

  effect("provides deterministic IDs from Message-ID", () =>
    Effect.gen(function* () {
      const canonical = makeDeterministicEmailId("<simple-001@enron.com>");
      const variant = makeDeterministicEmailId(" SIMPLE-001@ENRON.COM ");
      strictEqual(canonical, variant);
    })
  );

  effect("fails gracefully for malformed email missing Message-ID", () =>
    Effect.gen(function* () {
      const raw = yield* readFixture("malformed-email.eml");
      const result = yield* Effect.either(parseEmail(raw));
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        strictEqual(result.left._tag, "EnronParseError");
      }
    })
  );

  effect("normalization strips trailing signatures", () =>
    Effect.gen(function* () {
      const normalized = normalizeEmailBody("Hello\n\nThanks,\nJane Doe\nSent from my phone");
      strictEqual(normalized, "Hello");
    })
  );
});
