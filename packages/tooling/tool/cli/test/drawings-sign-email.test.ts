import { GraphMessageAuthoredText, M365, M365Error } from "@beep/m365";
import { MailReaderFromM365, MailReaderUnavailable } from "@beep/repo-cli/commands/Drawings";
import { approvalStatement, EmailAddress, MailReader, Sha256Hex, verifyConfirmation } from "@beep/technical-drawing";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import type { M365Shape } from "@beep/m365";

const sheetSet = Sha256Hex.make("8d5be0c406afacf451f01d2343597810bc62dfee8f0f95bf001bf057bb894029");

// Recorded reply shape: Graph v1.0 message, $select'd fields, text preference.
const recordedReply = {
  "@odata.etag": 'W/"CQAAABYAAAA"',
  id: "AAMkAGI2",
  internetMessageId: "<CAF=reply@mail.example.com>",
  receivedDateTime: "2026-10-06T12:00:00Z",
  from: { emailAddress: { name: "Attorney", address: "Attorney@Example.com" } },
  sender: { emailAddress: { name: "Attorney", address: "attorney@example.com" } },
  uniqueBody: {
    contentType: "text",
    content: `Reviewed all eight sheets.\r\n${approvalStatement(sheetSet)}\r\n\r\nThanks,\r\nA.\r\n`,
  },
};

const unused = Effect.fnUntraced(function* () {
  return yield* Effect.die("not used by drawings sign");
});

// Every Graph operation dies except the one `drawings sign` reads.
const fakeM365 = (getMessageAuthoredText: M365Shape["getMessageAuthoredText"]) =>
  M365.of({
    addMessageAttachment: unused,
    createDraftMessage: unused,
    createEvent: unused,
    createMasterCategory: unused,
    deleteDraftMessage: unused,
    deleteEvent: unused,
    deltaDriveItems: unused,
    downloadDriveItemContent: unused,
    downloadMessageAttachment: unused,
    ensureMasterCategories: unused,
    findEventsByIdempotencyKey: unused,
    getEvent: unused,
    getListItem: unused,
    getMailFolder: unused,
    getMessage: unused,
    getMessageAuthoredText,
    getSite: unused,
    listDriveItemVersions: unused,
    listDrives: unused,
    listEvents: unused,
    listMasterCategories: unused,
    listMessageAttachments: unused,
    listMessages: unused,
    listSites: unused,
    sendDraftMessage: unused,
    updateEvent: unused,
    updateMessageCategories: unused,
  });

const replyLayer = (reply: unknown) =>
  Layer.effect(
    M365,
    Effect.gen(function* () {
      const message = yield* S.decodeUnknownEffect(GraphMessageAuthoredText)(reply);
      return fakeM365(
        Effect.fnUntraced(function* () {
          return message;
        })
      );
    })
  );

const FakeM365 = replyLayer(recordedReply);

describe("beep drawings sign email", () => {
  it.layer(MailReaderFromM365.pipe(Layer.provide(FakeM365)), { timeout: "10 seconds" })((it) => {
    it.effect(
      "a recorded attorney reply decodes to a non-empty text uniqueBody and approves the sheet set",
      Effect.fnUntraced(function* () {
        const mail = yield* MailReader;
        const confirmation = yield* mail.authoredText("AAMkAGI2");
        expect(confirmation.authoredText.length).toBeGreaterThan(0);
        // addresses are normalised, so a capitalised `from` still matches
        expect(confirmation.from).toBe("attorney@example.com");
        const checked = verifyConfirmation({
          sheetSetSha256: sheetSet,
          approver: EmailAddress.make("attorney@example.com"),
          confirmation,
        });
        expect(Result.isSuccess(checked)).toBe(true);
      })
    );
  });
});

describe("beep drawings sign email refusals", () => {
  it.layer(
    MailReaderFromM365.pipe(
      Layer.provide(
        Layer.succeed(
          M365,
          fakeM365(
            Effect.fnUntraced(function* () {
              return yield* M365Error.fromReason("response decoding");
            })
          )
        )
      )
    ),
    { timeout: "10 seconds" }
  )((it) => {
    it.effect(
      "refuses a reply the mail service cannot return as plain text",
      Effect.fnUntraced(function* () {
        const error = yield* Effect.flip((yield* MailReader).authoredText("AAMkAGI2"));
        expect([error.reason, error.message]).toEqual([
          "approval",
          "Could not read a plain-text reply from the mail service; an HTML-only or unreadable reply is refused.",
        ]);
      })
    );
  });

  it.layer(
    MailReaderFromM365.pipe(
      Layer.provide(
        replyLayer({ ...recordedReply, sender: { emailAddress: { name: "Relay", address: "mail relay" } } })
      )
    ),
    { timeout: "10 seconds" }
  )((it) => {
    it.effect(
      "refuses a reply whose sender is not an email address",
      Effect.fnUntraced(function* () {
        const error = yield* Effect.flip((yield* MailReader).authoredText("AAMkAGI2"));
        expect([error.reason, error.message]).toEqual(["approval", '"mail relay" is not an email address.']);
      })
    );
  });

  it.layer(MailReaderUnavailable, { timeout: "10 seconds" })((it) => {
    it.effect(
      "refuses every read on the PDF route, where mail is not configured",
      Effect.fnUntraced(function* () {
        const error = yield* Effect.flip((yield* MailReader).authoredText("AAMkAGI2"));
        expect([error.reason, error.message]).toEqual(["approval", "Mail is not configured for this command."]);
      })
    );
  });
});
