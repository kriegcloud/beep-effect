import {faker} from "@faker-js/faker";
import * as Either from "effect/Either";
import * as S from "effect/Schema";
import {sid} from "./id";
import {annotate, makeMocker} from "./utils";

export namespace URLString {
  export const Schema = annotate(
    S.NonEmptyTrimmedString.pipe(
      S.pattern(/^https?:\/\/.+/),
      S.filter((a) => Either.try(() => new URL(a)).pipe(Either.isRight)),
      S.annotations({
        arbitrary: () => (fc) =>
          fc.constant(null).map(() => faker.internet.url()),
      }),
      S.brand("URLString"),
    ), {
      identifier: sid.shared.schema("URLString.Schema"),
      description: "A URL string",
      title: "URL String",
      jsonSchema: {
        type: "string",
        format: "url"
      }
    });

  export type Type = typeof Schema.Type;

  export const Mock = makeMocker(Schema);
}