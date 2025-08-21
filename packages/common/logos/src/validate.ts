import * as Either from "effect/Either";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { RootUnion } from "./union";

/**
 * Validates a root union before running it.
 * @export
 * @param {RootUnion} root
 * @return {*}  {({ isValid: true } | { isValid: false; reason: string })}
 */
export function validate(
  root: RootUnion.Type,
): { isValid: true } | { isValid: false; reason: string } {
  const validated = S.encodeEither(RootUnion)(root);

  if (Either.isLeft(validated)) {
    return {
      isValid: false,
      reason: Either.getLeft(validated).pipe((i) =>
        O.isSome(i)
          ? ParseResult.ArrayFormatter.formatErrorSync(i.value).join("\n")
          : "Unknown error",
      ),
    };
  }

  return { isValid: true };
}
