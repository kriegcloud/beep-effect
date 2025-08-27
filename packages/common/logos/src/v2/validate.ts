import * as Either from "effect/Either";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { RuleSet } from "./RuleSet";

/**
 * Validates a root group before running it.
 * @export
 * @param {RuleSet} root
 * @return {*}  {({ isValid: true } | { isValid: false; reason: string })}
 */
export function validate(
  root: RuleSet.Type,
): { isValid: true } | { isValid: false; reason: string } {
  const validated = S.encodeEither(RuleSet)(root);

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
