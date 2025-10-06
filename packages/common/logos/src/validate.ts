import * as Either from "effect/Either";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { RootGroup } from "./groups";

/**
 * Validates a root group before running it.
 * @export
 * @param {RootGroup} root
 * @return {*}  {({ isValid: true } | { isValid: false; reason: string })}
 */
export function validate(root: RootGroup.Type): { isValid: true } | { isValid: false; reason: string } {
  const validated = S.encodeEither(RootGroup)(root);

  if (Either.isLeft(validated)) {
    return {
      isValid: false,
      reason: Either.getLeft(validated).pipe((i) =>
        O.isSome(i) ? ParseResult.ArrayFormatter.formatErrorSync(i.value).join("\n") : "Unknown error"
      ),
    };
  }

  return { isValid: true };
}
