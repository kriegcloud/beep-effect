import { make } from "@beep/identity";
import * as S from "effect/Schema";

const $I = make("beep").$BeepId.create("scratchpad");

const Event = S.Union([
  S.Struct({
    kind: S.tag("close"),
    code: S.Number,
  }),
  S.Struct({
    kind: S.tag("message"),
    text: S.String,
  }),
]).pipe(S.toTaggedUnion("kind"));

const AnnotatedAfterTaggedUnion = Event.pipe(
  $I.annoteSchema("IdentityAnnoteSchemaStaticsRepro", {
    description: "Scratchpad repro for statics dropped after annoteSchema.",
  })
);

console.log({
  originalCases: Reflect.has(Event, "cases"),
  annotatedCases: Reflect.has(AnnotatedAfterTaggedUnion, "cases"),
  originalMatch: Reflect.has(Event, "match"),
  annotatedMatch: Reflect.has(AnnotatedAfterTaggedUnion, "match"),
  messageCaseAvailable: AnnotatedAfterTaggedUnion.cases.message !== undefined,
  matched: AnnotatedAfterTaggedUnion.match(
    { kind: "message", text: "hello" },
    {
      close: () => "close",
      message: () => "message",
    }
  ),
});
