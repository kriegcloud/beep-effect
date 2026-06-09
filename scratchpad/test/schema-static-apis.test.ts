import { LiteralKit, MappedLiteralKit } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";

// =============================================================================
// Example 1: upstream S.TaggedUnion static APIs
// =============================================================================

const DeliveryCommand = S.TaggedUnion({
  Email: {
    to: S.NonEmptyString,
    subject: S.NonEmptyString,
  },
  Sms: {
    to: S.NonEmptyString,
    body: S.NonEmptyString,
  },
});

// =============================================================================
// Example 2: repo-local LiteralKit static APIs
// =============================================================================

const ReviewStatus = LiteralKit(["draft", "ready", "blocked"]);

const ReviewEvent = ReviewStatus.toTaggedUnion("status")({
  draft: {
    editorId: S.NonEmptyString,
  },
  ready: {
    approverId: S.NonEmptyString,
  },
  blocked: {
    reason: S.NonEmptyString,
  },
});

// =============================================================================
// Example 3: mapped literal APIs for protocol/code translations
// =============================================================================

const HttpOutcome = MappedLiteralKit([
  ["OK", "200"],
  ["NOT_FOUND", "404"],
] as const);

describe("schema-derived static APIs", () => {
  it("uses TaggedUnion.cases, guards, isAnyOf, and match", () => {
    // cases expose case schemas and constructors, so callers do not hard-code
    // the discriminator or duplicate case-specific make helpers.
    const command = DeliveryCommand.cases.Email.make({
      to: "team@example.test",
      subject: "Schema statics are useful",
    });

    expect(command._tag).toBe("Email");
    expect(DeliveryCommand.guards.Email(command)).toBe(true);
    expect(DeliveryCommand.guards.Sms(command)).toBe(false);
    expect(DeliveryCommand.isAnyOf(["Email"])(command)).toBe(true);

    // match keeps branch handling next to the schema and forces exhaustive
    // cases at the type level.
    const rendered = DeliveryCommand.match(command, {
      Email: ({ subject }) => `email:${subject}`,
      Sms: ({ body }) => `sms:${body}`,
    });

    expect(rendered).toBe("email:Schema statics are useful");
  });

  it("uses LiteralKit helpers instead of parallel constants and guards", () => {
    expect(ReviewStatus.Options).toEqual(["draft", "ready", "blocked"]);
    expect(ReviewStatus.Enum.ready).toBe("ready");
    expect(ReviewStatus.is.ready("ready")).toBe(true);
    expect(ReviewStatus.is.ready("draft")).toBe(false);
    expect(ReviewStatus.pickOptions(["draft", "ready"])).toEqual(["draft", "ready"]);
    expect(ReviewStatus.omitOptions(["blocked"])).toEqual(["draft", "ready"]);
    expect(ReviewStatus.thunk.blocked()).toBe("blocked");

    const label = ReviewStatus.$match(ReviewStatus.Enum.blocked, {
      draft: () => "still editing",
      ready: () => "ready for review",
      blocked: () => "needs attention",
    });

    expect(label).toBe("needs attention");
  });

  it("uses LiteralKit.toTaggedUnion to build tagged cases from a literal domain", () => {
    const event = ReviewEvent.cases.blocked.make({
      reason: "Missing launch checklist",
    });

    expect(event.status).toBe(ReviewStatus.Enum.blocked);
    expect(ReviewEvent.guards.blocked(event)).toBe(true);

    const summary = ReviewEvent.match(event, {
      draft: ({ editorId }) => `draft:${editorId}`,
      ready: ({ approverId }) => `ready:${approverId}`,
      blocked: ({ reason }) => `blocked:${reason}`,
    });

    expect(summary).toBe("blocked:Missing launch checklist");
  });

  it("uses MappedLiteralKit directional statics for encoded and decoded literal domains", () => {
    expect(HttpOutcome.Options).toEqual(["OK", "NOT_FOUND"]);
    expect(HttpOutcome.Enum.OK).toBe("200");
    expect(HttpOutcome.From.Enum.NOT_FOUND).toBe("404");
    expect(HttpOutcome.To.Enum["404"]).toBe("NOT_FOUND");
    expect(HttpOutcome.is.OK("OK")).toBe(true);
    expect(HttpOutcome.To.is["200"]("200")).toBe(true);

    const decoded = S.decodeUnknownOption(HttpOutcome)("NOT_FOUND");
    const encoded = S.encodeUnknownOption(HttpOutcome)("404");

    expect(O.getOrThrow(decoded)).toBe("404");
    expect(O.getOrThrow(encoded)).toBe("NOT_FOUND");
  });
});
