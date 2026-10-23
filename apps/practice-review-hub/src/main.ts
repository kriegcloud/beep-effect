import { DailyNoticeOutcome } from "@beep/law-practice-use-cases/DailyNotice";
import { loadM365AppOnlyEnv, M365, M365AppOnlyConfigInput, M365MailAddress } from "@beep/m365";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunServices from "@effect/platform-bun/BunServices";
import * as Console from "effect/Console";
import * as Command from "effect/cli/Command";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { decodeReviewHubConfig, ReviewNoticeConfig, reviewHubFlags, reviewNoticeFlags } from "./Config.ts";
import { makeNoticeLayer, NOTICE_ENV_PREFIX, sendDailyNotice } from "./Notice.ts";
import { makeReviewHubServer } from "./runtime/Layer.ts";

const printOutcome = flow(
  sendDailyNotice,
  Effect.flatMap(S.encodeEffect(S.fromJsonString(DailyNoticeOutcome))),
  Effect.flatMap(Console.log)
);

// Serve until interrupted. Portless injects PORT for practice-review-hub.beep.localhost.
const serve = Command.make("serve", reviewHubFlags, (flags) =>
  Effect.flatMap(decodeReviewHubConfig(flags), (config) => Layer.launch(makeReviewHubServer(config)))
).pipe(Command.withDescription("Serve the review hub's MCP endpoint on 127.0.0.1."));

// Send today's notice if one is due, and print its outcome as one JSON line: a
// status, the day, and for a sent notice the count it said, never a question.
// The Claude Code folder goes only into the email, never into this line.
const notice = Command.make(
  "notice",
  reviewNoticeFlags,
  Effect.fnUntraced(function* (flags) {
    const config = yield* S.decodeEffect(ReviewNoticeConfig)(flags);
    const settings = yield* loadM365AppOnlyEnv(NOTICE_ENV_PREFIX);
    const mailbox = yield* S.decodeEffect(M365MailAddress)(settings.mailbox);
    yield* Layer.effectDiscard(printOutcome(config.timeZone)).pipe(
      Layer.provide(
        makeNoticeLayer({ claudeFolder: config.claudeFolder, dataDirectory: config.dataDirectory, mailbox })
      ),
      Layer.provide(M365.makeAppOnlyLiveLayer(M365AppOnlyConfigInput.make(settings.appOnly))),
      Layer.build,
      Effect.scoped
    );
  })
).pipe(Command.withDescription("Email the attorney how many questions wait today, at most once a day."));

Layer.effectDiscard(
  Command.run(Command.make("practice-review-hub").pipe(Command.withSubcommands([serve, notice])), {
    version: "0.0.0",
  })
).pipe(Layer.provide(BunServices.layer), Layer.build, Effect.scoped, BunRuntime.runMain);
