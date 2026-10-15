/**
 * The notice-mailbox adapter over a fake `M365` mailbox and a real temporary
 * directory for the last-sent day. No request leaves the process; the
 * mailbox and notice here are synthetic.
 */

import { makeNoticeMailboxLayer, NoticeMailboxConfig } from "@beep/law-practice-server/NoticeMailbox";
import { NoticeMailbox, NoticeMessage } from "@beep/law-practice-use-cases/DailyNotice";
import { GraphMessage } from "@beep/m365";
import { LocalDate } from "@beep/schema/LocalDate";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as Ref from "effect/Ref";
import { makeM365Stub, oneRun, Platform, serviceOf, temporaryDirectory } from "./MailTagging.adapters.fixture.ts";
import type { M365CreateDraftMessageRequest, M365SendDraftMessageRequest } from "@beep/m365";

const MAILBOX = "attorney@example.test";

type Calls = {
  readonly drafts: ReadonlyArray<M365CreateDraftMessageRequest>;
  readonly sends: ReadonlyArray<M365SendDraftMessageRequest>;
};

// Records every draft and send; each draft gets the next id.
const fakeMailbox = (calls: Ref.Ref<Calls>) =>
  makeM365Stub({
    createDraftMessage: (request) =>
      Ref.modify(calls, (current) => {
        const draft = GraphMessage.make({ id: `draft-${A.length(current.drafts) + 1}` });
        const next: readonly [GraphMessage, Calls] = [draft, { ...current, drafts: A.append(current.drafts, request) }];
        return next;
      }),
    sendDraftMessage: (request) =>
      Ref.update(calls, (current) => ({ ...current, sends: A.append(current.sends, request) })),
  });

const mailboxIn = Effect.fnUntraced(function* (stateFile: string, calls: Ref.Ref<Calls>) {
  const config = NoticeMailboxConfig.make({ mailbox: MAILBOX, stateFile });
  return yield* serviceOf(NoticeMailbox)(makeNoticeMailboxLayer(config).pipe(Layer.provide(fakeMailbox(calls))));
});

describe("@beep/law-practice-server NoticeMailbox", () => {
  it.layer(Platform, { timeout: "10 seconds" })("over a temporary state file", (it) => {
    it.effect("sends from the mailbox to itself and keeps the last sent day", () =>
      oneRun(
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const stateFile = path.join(yield* temporaryDirectory, "notice-last-sent");
          const calls = yield* Ref.make<Calls>({ drafts: [], sends: [] });
          const mailbox = yield* mailboxIn(stateFile, calls);

          assertNone(yield* mailbox.lastSentOn);
          const day = LocalDate.make({ year: 2026, month: 10, day: 14 });
          yield* mailbox.recordSentOn(day);
          yield* mailbox.send(
            NoticeMessage.make({ subject: "Claude: 2 questions waiting", body: "2 questions are waiting in Claude." })
          );

          assertSome(yield* mailbox.lastSentOn, day);
          expect(yield* (yield* FileSystem.FileSystem).readFileString(stateFile)).toBe("2026-10-14\n");
          const { drafts, sends } = yield* Ref.get(calls);
          expect(
            A.map(drafts, ({ draft, userId }) => [
              draft.subject,
              draft.body.content,
              draft.body.contentType,
              draft.toRecipients,
              O.getOrElse(userId, () => "no user id"),
            ])
          ).toStrictEqual([
            ["Claude: 2 questions waiting", "2 questions are waiting in Claude.", "text", [MAILBOX], MAILBOX],
          ]);
          expect(A.map(sends, ({ messageId }) => messageId)).toStrictEqual(["draft-1"]);
        })
      )
    );

    it.effect("fails the read when the state file names no day", () =>
      oneRun(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const stateFile = path.join(yield* temporaryDirectory, "notice-last-sent");
          yield* fs.writeFileString(stateFile, "not a date\n");
          const mailbox = yield* mailboxIn(stateFile, yield* Ref.make<Calls>({ drafts: [], sends: [] }));

          const failure = yield* Effect.flip(mailbox.lastSentOn);

          expect(failure.operation).toBe("read");
        })
      )
    );
  });
});
