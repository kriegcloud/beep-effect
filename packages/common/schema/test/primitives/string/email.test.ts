/**
 * Tests for Email schemas including EmailFromCommaDelimitedString.
 *
 * Verifies decode/encode behavior, validation, error handling, and edge cases.
 */

import { Email, EmailBase, EmailEncoded, EmailFromCommaDelimitedString } from "@beep/schema/primitives/string/email";
import { assertFalse, assertInclude, assertTrue, deepStrictEqual, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as E from "effect/Either";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Test Helpers
// -----------------------------------------------------------------------------

const decodeEmails = S.decodeUnknownSync(EmailFromCommaDelimitedString);
const decodeEmailsEither = S.decodeUnknownEither(EmailFromCommaDelimitedString);
const encodeEmails = S.encodeSync(EmailFromCommaDelimitedString);

const decodeEmail = S.decodeUnknownSync(Email);
const decodeEmailBase = S.decodeUnknownSync(EmailBase);
const decodeEmailEncoded = S.decodeUnknownSync(EmailEncoded);

// -----------------------------------------------------------------------------
// EmailEncoded Tests
// -----------------------------------------------------------------------------

describe("EmailEncoded", () => {
  effect("decodes a valid email string", () =>
    Effect.sync(() => {
      const result = decodeEmailEncoded("test@example.com");
      strictEqual(result, "test@example.com");
    })
  );

  effect("lowercases email addresses", () =>
    Effect.sync(() => {
      const result = decodeEmailEncoded("TEST@EXAMPLE.COM");
      strictEqual(result, "test@example.com");
    })
  );

  effect("trims whitespace", () =>
    Effect.sync(() => {
      const result = decodeEmailEncoded("  test@example.com  ");
      strictEqual(result, "test@example.com");
    })
  );

  effect("rejects empty strings", () =>
    Effect.sync(() => {
      const result = S.decodeUnknownEither(EmailEncoded)("");
      assertTrue(E.isLeft(result));
    })
  );

  effect("rejects whitespace-only strings", () =>
    Effect.sync(() => {
      const result = S.decodeUnknownEither(EmailEncoded)("   ");
      assertTrue(E.isLeft(result));
    })
  );

  effect("rejects invalid email formats", () =>
    Effect.sync(() => {
      assertTrue(E.isLeft(S.decodeUnknownEither(EmailEncoded)("not-an-email")));
      assertTrue(E.isLeft(S.decodeUnknownEither(EmailEncoded)("missing@")));
      assertTrue(E.isLeft(S.decodeUnknownEither(EmailEncoded)("@nodomain.com")));
    })
  );
});

// -----------------------------------------------------------------------------
// EmailBase Tests
// -----------------------------------------------------------------------------

describe("EmailBase", () => {
  effect("decodes and brands a valid email", () =>
    Effect.sync(() => {
      const result = decodeEmailBase("test@example.com");
      strictEqual(result, "test@example.com");
      assertTrue(S.is(EmailBase)(result));
    })
  );

  effect("applies lowercase and trim transformations", () =>
    Effect.sync(() => {
      const result = decodeEmailBase("  TEST@EXAMPLE.COM  ");
      strictEqual(result, "test@example.com");
    })
  );
});

// -----------------------------------------------------------------------------
// Email (Redacted) Tests
// -----------------------------------------------------------------------------

describe("Email", () => {
  effect("decodes to a Redacted value", () =>
    Effect.sync(() => {
      const result = decodeEmail("test@example.com");
      assertTrue(Redacted.isRedacted(result));
    })
  );

  effect("extracts the underlying value with Email.value", () =>
    Effect.sync(() => {
      const result = decodeEmail("test@example.com");
      const value = Email.value(result);
      strictEqual(value, "test@example.com");
    })
  );

  effect("make creates a Redacted email", () =>
    Effect.sync(() => {
      const result = Email.make("test@example.com");
      assertTrue(Redacted.isRedacted(result));
      strictEqual(Email.value(result), "test@example.com");
    })
  );

  effect("prevents PII leakage in string representation", () =>
    Effect.sync(() => {
      const result = Email.make("secret@example.com");
      const stringified = String(result);
      assertFalse(stringified.includes("secret@example.com"));
      assertInclude(stringified, "<redacted>");
    })
  );
});

// -----------------------------------------------------------------------------
// EmailFromCommaDelimitedString - Decode Tests
// -----------------------------------------------------------------------------

describe("EmailFromCommaDelimitedString", () => {
  describe("decode", () => {
    effect("decodes a single email successfully", () =>
      Effect.sync(() => {
        const result = decodeEmails("beep@gmail.com");

        strictEqual(A.length(result), 1);
        const first = A.unsafeGet(result, 0);
        strictEqual(Email.value(first), "beep@gmail.com");
      })
    );

    effect("decodes multiple comma-separated emails", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,bob@example.com,charlie@example.com");

        strictEqual(A.length(result), 3);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 2)), "charlie@example.com");
      })
    );

    effect("trims whitespace around each email", () =>
      Effect.sync(() => {
        const result = decodeEmails("  alice@example.com  ,  bob@example.com  ");

        strictEqual(A.length(result), 2);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
      })
    );

    effect("handles mixed whitespace patterns", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,   bob@example.com,charlie@example.com   ");

        strictEqual(A.length(result), 3);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 2)), "charlie@example.com");
      })
    );

    effect("filters out empty segments from trailing comma", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,bob@example.com,");

        strictEqual(A.length(result), 2);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
      })
    );

    effect("filters out empty segments from leading comma", () =>
      Effect.sync(() => {
        const result = decodeEmails(",alice@example.com,bob@example.com");

        strictEqual(A.length(result), 2);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
      })
    );

    effect("filters out empty segments from consecutive commas", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,,bob@example.com");

        strictEqual(A.length(result), 2);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
      })
    );

    effect("filters out whitespace-only segments", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,   ,bob@example.com");

        strictEqual(A.length(result), 2);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
      })
    );

    effect("returns empty array for empty string", () =>
      Effect.sync(() => {
        const result = decodeEmails("");
        strictEqual(A.length(result), 0);
      })
    );

    effect("returns empty array for whitespace-only string", () =>
      Effect.sync(() => {
        const result = decodeEmails("   ");
        strictEqual(A.length(result), 0);
      })
    );

    effect("returns empty array for comma-only string", () =>
      Effect.sync(() => {
        const result = decodeEmails(",,,");
        strictEqual(A.length(result), 0);
      })
    );

    effect("lowercases all email addresses", () =>
      Effect.sync(() => {
        const result = decodeEmails("ALICE@EXAMPLE.COM,Bob@Example.Com");

        strictEqual(A.length(result), 2);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
      })
    );

    effect("returns Redacted values for all emails", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,bob@example.com");
        assertTrue(A.every(result, Redacted.isRedacted));
      })
    );

    effect("validates type with S.is", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,bob@example.com");
        assertTrue(S.is(EmailFromCommaDelimitedString)(result));
      })
    );
  });

  describe("decode errors", () => {
    effect("fails on invalid email format in list", () =>
      Effect.sync(() => {
        const result = decodeEmailsEither("alice@example.com,not-an-email,bob@example.com");

        assertTrue(E.isLeft(result));
        if (E.isLeft(result)) {
          const message = String(result.left);
          assertInclude(message, "not-an-email");
        }
      })
    );

    effect("fails on email missing domain", () =>
      Effect.sync(() => {
        const result = decodeEmailsEither("alice@example.com,bob@");
        assertTrue(E.isLeft(result));
      })
    );

    effect("fails on email missing local part", () =>
      Effect.sync(() => {
        const result = decodeEmailsEither("@example.com,bob@example.com");
        assertTrue(E.isLeft(result));
      })
    );

    effect("fails on email with spaces in address", () =>
      Effect.sync(() => {
        const result = decodeEmailsEither("alice @example.com");
        assertTrue(E.isLeft(result));
      })
    );

    effect("provides descriptive error message for invalid email", () =>
      Effect.sync(() => {
        const result = decodeEmailsEither("valid@example.com,invalid-email");

        assertTrue(E.isLeft(result));
        if (E.isLeft(result)) {
          const message = String(result.left);
          assertInclude(message, "Invalid email format in list");
          assertInclude(message, "invalid-email");
        }
      })
    );

    effect("identifies first invalid email in list", () =>
      Effect.sync(() => {
        const result = decodeEmailsEither("bad1,bad2,bad3");

        assertTrue(E.isLeft(result));
        if (E.isLeft(result)) {
          const message = String(result.left);
          assertInclude(message, "bad1");
        }
      })
    );
  });

  describe("encode", () => {
    effect("encodes array of emails to comma-delimited string", () =>
      Effect.sync(() => {
        const emails = [Email.make("alice@example.com"), Email.make("bob@example.com")];
        const result = encodeEmails(emails);
        strictEqual(result, "alice@example.com,bob@example.com");
      })
    );

    effect("encodes single email array", () =>
      Effect.sync(() => {
        const emails = [Email.make("beep@gmail.com")];
        const result = encodeEmails(emails);
        strictEqual(result, "beep@gmail.com");
      })
    );

    effect("encodes empty array to empty string", () =>
      Effect.sync(() => {
        const emails: Email.Type[] = [];
        const result = encodeEmails(emails);
        strictEqual(result, "");
      })
    );

    effect("preserves email order during encode", () =>
      Effect.sync(() => {
        const emails = [
          Email.make("charlie@example.com"),
          Email.make("alice@example.com"),
          Email.make("bob@example.com"),
        ];
        const result = encodeEmails(emails);
        strictEqual(result, "charlie@example.com,alice@example.com,bob@example.com");
      })
    );
  });

  describe("roundtrip", () => {
    effect("decode then encode preserves original (normalized)", () =>
      Effect.sync(() => {
        const input = "alice@example.com, bob@example.com, charlie@example.com";
        const decoded = decodeEmails(input);
        const encoded = encodeEmails(decoded);
        strictEqual(encoded, "alice@example.com,bob@example.com,charlie@example.com");
      })
    );

    effect("encode then decode preserves values", () =>
      Effect.sync(() => {
        const emails = [Email.make("alice@example.com"), Email.make("bob@example.com")];
        const encoded = encodeEmails(emails);
        const decoded = decodeEmails(encoded);

        strictEqual(A.length(decoded), 2);
        strictEqual(Email.value(A.unsafeGet(decoded, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(decoded, 1)), "bob@example.com");
      })
    );

    effect("roundtrip with single email", () =>
      Effect.sync(() => {
        const input = "beep@gmail.com";
        const decoded = decodeEmails(input);
        const encoded = encodeEmails(decoded);
        const reDecoded = decodeEmails(encoded);

        strictEqual(Email.value(A.unsafeGet(reDecoded, 0)), "beep@gmail.com");
      })
    );

    effect("roundtrip normalizes case", () =>
      Effect.sync(() => {
        const input = "ALICE@EXAMPLE.COM,BOB@EXAMPLE.COM";
        const decoded = decodeEmails(input);
        const encoded = encodeEmails(decoded);
        strictEqual(encoded, "alice@example.com,bob@example.com");
      })
    );

    effect("roundtrip normalizes whitespace", () =>
      Effect.sync(() => {
        const input = "  alice@example.com  ,  bob@example.com  ";
        const decoded = decodeEmails(input);
        const encoded = encodeEmails(decoded);
        strictEqual(encoded, "alice@example.com,bob@example.com");
      })
    );
  });

  describe("edge cases", () => {
    effect("handles email with plus addressing", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice+tag@example.com");

        strictEqual(A.length(result), 1);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice+tag@example.com");
      })
    );

    effect("handles email with subdomain", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@mail.example.com");

        strictEqual(A.length(result), 1);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@mail.example.com");
      })
    );

    effect("handles email with numbers", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice123@example123.com");

        strictEqual(A.length(result), 1);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice123@example123.com");
      })
    );

    effect("handles email with dots in local part", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice.bob@example.com");

        strictEqual(A.length(result), 1);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice.bob@example.com");
      })
    );

    effect("handles email with hyphens in domain", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@my-example.com");

        strictEqual(A.length(result), 1);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@my-example.com");
      })
    );

    effect("handles very long email list", () =>
      Effect.sync(() => {
        const emailCount = 100;
        const emailList = A.makeBy(emailCount, (i) => `user${i}@example.com`);
        const input = A.join(emailList, ",");

        const result = decodeEmails(input);

        strictEqual(A.length(result), emailCount);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "user0@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 99)), "user99@example.com");
      })
    );

    effect("handles newlines and tabs as whitespace", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,\n\tbob@example.com");

        strictEqual(A.length(result), 2);
        strictEqual(Email.value(A.unsafeGet(result, 0)), "alice@example.com");
        strictEqual(Email.value(A.unsafeGet(result, 1)), "bob@example.com");
      })
    );
  });

  describe("type safety", () => {
    effect("decoded values are typed as Email.Type", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com");

        // Type assertion - this should compile
        const _typed: ReadonlyArray<Email.Type> = result;
        deepStrictEqual(_typed, result);
      })
    );

    effect("S.is guard works on decoded values", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com");
        assertTrue(S.is(S.Array(Email))(result));
      })
    );

    effect("individual elements pass Email type guard", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,bob@example.com");
        assertTrue(A.every(result, S.is(Email)));
      })
    );
  });

  describe("Either assertions", () => {
    effect("assertRight on successful decode", () =>
      Effect.sync(() => {
        const result = decodeEmailsEither("test@example.com");

        if (E.isRight(result)) {
          strictEqual(A.length(result.right), 1);
          strictEqual(Email.value(A.unsafeGet(result.right, 0)), "test@example.com");
        } else {
          throw new Error("Expected Right");
        }
      })
    );

    effect("assertLeft on failed decode", () =>
      Effect.sync(() => {
        const result = decodeEmailsEither("not-an-email");
        assertTrue(E.isLeft(result));
      })
    );
  });

  describe("Option integration", () => {
    effect("A.get returns Some for valid index", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com,bob@example.com");
        const first = A.get(result, 0);

        assertTrue(O.isSome(first));
        if (O.isSome(first)) {
          strictEqual(Email.value(first.value), "alice@example.com");
        }
      })
    );

    effect("A.get returns None for invalid index", () =>
      Effect.sync(() => {
        const result = decodeEmails("alice@example.com");
        const outOfBounds = A.get(result, 10);

        assertTrue(O.isNone(outOfBounds));
      })
    );

    effect("A.head returns first email", () =>
      Effect.sync(() => {
        const result = decodeEmails("first@example.com,second@example.com");
        const head = A.head(result);

        assertTrue(O.isSome(head));
        if (O.isSome(head)) {
          strictEqual(Email.value(head.value), "first@example.com");
        }
      })
    );

    effect("A.last returns last email", () =>
      Effect.sync(() => {
        const result = decodeEmails("first@example.com,second@example.com,last@example.com");
        const last = A.last(result);

        assertTrue(O.isSome(last));
        if (O.isSome(last)) {
          strictEqual(Email.value(last.value), "last@example.com");
        }
      })
    );
  });
});
