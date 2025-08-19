import { createRoot } from "@beep/logos/rules-engine/functions/create-root";
import { LogosEntityId } from "@beep/logos/rules-engine/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { expect, test } from "vitest";

test("root union is created", () => {
  const root = createRoot({ combinator: "and" });
  expect(root.entity).toBe("root_union");
  expect(root.rules.length).toBe(0);
  expect(S.decodeOption(LogosEntityId)(root.id).pipe(O.isSome)).toBeTruthy();
  expect(root.combinator).toBe("and");
});
