import type { DefaultAnnotations } from "@beep/schema/annotations";
import type { StringTypes } from "@beep/types";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";

export namespace EntityId {
  export const make =
    <Tag extends StringTypes.NonEmptyString>(tag: Tag) =>
    (annotations: DefaultAnnotations<B.Branded<string, Tag>>) =>
      S.UUID.pipe(S.brand(tag)).annotations({
        ...annotations,
        arbitrary: () => (fc) => fc.uuid().map((_) => _ as B.Branded<string, Tag>),
        pretty: () => (i) => `${tag}(${i})`,
      });

  export type Type<Tag extends string> = B.Branded<string, Tag>;
}
