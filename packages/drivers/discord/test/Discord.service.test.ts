import { Discord, DiscordChannelRequest, DiscordConfigInput, DiscordCreateMessageRequest } from "@beep/discord";
import { decodeJsonString } from "@beep/schema/Json";
import { describe, expect, layer } from "@effect/vitest";
import { Context, Effect, Layer, pipe, Redacted, Ref } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

class CapturedDiscordRequest extends S.Class<CapturedDiscordRequest>("CapturedDiscordRequest")({
  bodyText: S.optionalKey(S.String),
  headers: S.Record(S.String, S.String),
  method: S.String,
  url: S.String,
}) {}

class CapturedDiscordMessageAllowedMentions extends S.Class<CapturedDiscordMessageAllowedMentions>(
  "CapturedDiscordMessageAllowedMentions"
)({
  parse: S.Array(S.String),
}) {}

class CapturedDiscordMessageBody extends S.Class<CapturedDiscordMessageBody>("CapturedDiscordMessageBody")({
  allowed_mentions: CapturedDiscordMessageAllowedMentions,
  content: S.String,
}) {}

type DiscordTestHttpShape = {
  readonly capture: (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<void>;
  readonly captures: Effect.Effect<ReadonlyArray<CapturedDiscordRequest>>;
  readonly reset: Effect.Effect<void>;
};

class DiscordTestHttp extends Context.Service<DiscordTestHttp, DiscordTestHttpShape>()(
  "@beep/discord/test/Discord.service.test/DiscordTestHttp"
) {}

const decodeMessageBody = S.decodeUnknownEffect(CapturedDiscordMessageBody);

const bodyTextFor = (request: HttpClientRequest.HttpClientRequest): string | undefined =>
  request.body._tag === "Uint8Array" ? new TextDecoder().decode(request.body.body) : undefined;

const responseFor = (request: HttpClientRequest.HttpClientRequest): Response =>
  request.method === "GET"
    ? Response.json({ guild_id: "guild-1", id: "channel-1", name: "proof-channel" })
    : Response.json({ channel_id: "channel-1", id: "message-1", timestamp: "2026-05-14T14:30:00.000Z" });

const DiscordTestHttpLayer = Layer.effect(
  DiscordTestHttp,
  Effect.gen(function* () {
    const capturesRef = yield* Ref.make<ReadonlyArray<CapturedDiscordRequest>>([]);

    return DiscordTestHttp.of({
      capture: Effect.fn("DiscordTestHttp.capture")(function* (request) {
        const url = O.getOrElse(
          O.map(HttpClientRequest.toUrl(request), (value) => value.toString()),
          () => request.url
        );
        const bodyText = bodyTextFor(request);
        yield* Ref.update(
          capturesRef,
          A.append(
            new CapturedDiscordRequest({
              headers: request.headers,
              method: request.method,
              url,
              ...R.getSomes({
                bodyText: O.fromUndefinedOr(bodyText),
              }),
            })
          )
        );
      }),
      captures: Ref.get(capturesRef),
      reset: Ref.set(capturesRef, []),
    });
  })
);

const TestHttpClientLayer = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const testHttp = yield* DiscordTestHttp;

    return HttpClient.make((request) =>
      Effect.gen(function* () {
        yield* testHttp.capture(request);
        return HttpClientResponse.fromWeb(request, responseFor(request));
      })
    );
  })
);

const makeLayer = () =>
  Discord.makeLayer(new DiscordConfigInput({ baseUrl: "https://discord.example.test/api/v10" })).pipe(
    Layer.provide(TestHttpClientLayer),
    Layer.provideMerge(DiscordTestHttpLayer)
  );

describe("@beep/discord", () => {
  layer(makeLayer())((it) => {
    it.effect(
      "probes channel liveness and sends a test message with mentions disabled",
      Effect.fnUntraced(function* () {
        const discord = yield* Discord;
        const testHttp = yield* DiscordTestHttp;
        yield* testHttp.reset;

        const channel = yield* discord.getChannel(
          new DiscordChannelRequest({ channelId: "channel-1" }),
          Redacted.make("bot-token")
        );
        const message = yield* discord.createMessage(
          new DiscordCreateMessageRequest({ channelId: "channel-1", content: "P1 proof" }),
          Redacted.make("bot-token")
        );
        const captures = yield* testHttp.captures;
        const messageCapture = yield* pipe(
          A.get(captures, 1),
          O.match({
            onNone: () => Effect.die("missing message capture"),
            onSome: Effect.succeed,
          })
        );
        const rawBody = yield* Effect.succeed(messageCapture.bodyText ?? "{}");
        const body = yield* decodeJsonString(rawBody).pipe(Effect.flatMap(decodeMessageBody));

        expect(channel.channelId).toBe("channel-1");
        expect(message.messageId).toBe("message-1");
        expect(messageCapture.headers.authorization).toBe("Bot bot-token");
        expect(body.allowed_mentions.parse).toEqual([]);
      })
    );
  });
});
