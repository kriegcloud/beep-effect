import { thunkSomeEmptyRecord } from "@beep/utils";
import { pipe } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";

/**
 * Normalized rule violation payload shared by local ESLint rules.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RuleViolation extends S.Class<RuleViolation>("RuleViolation")({
  kind: S.String,
  messageId: S.String,
  data: S.Record(S.String, S.String).pipe(
    S.withConstructorDefault(thunkSomeEmptyRecord<string, string>),
    S.withDecodingDefault(R.empty<string, string>)
  ),
}) {}

/**
 * Encoded-compatible payload schema used by schema transformations.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RuleViolationPayload extends S.Class<RuleViolationPayload>("RuleViolationPayload")({
  kind: S.String,
  messageId: S.String,
  data: S.optionalKey(S.Record(S.String, S.String)),
}) {}

/**
 * Construct a normalized rule violation payload.
 *
 * @since 0.0.0
 * @category Utility
 */
export const makeRuleViolation = (kind: string, messageId: string, data = R.empty<string, string>()): RuleViolation =>
  new RuleViolation({ kind, messageId, data });

/**
 * Construct an encoded-compatible payload for schema transformations.
 *
 * @since 0.0.0
 * @category Utility
 */
export const makeRuleViolationPayload = (
  kind: string,
  messageId: string,
  data?: Readonly<Record<string, string>>
): RuleViolationPayload =>
  pipe(
    O.fromNullishOr(data),
    O.match({
      onNone: () => new RuleViolationPayload({ kind, messageId }),
      onSome: (resolvedData) => new RuleViolationPayload({ kind, messageId, data: resolvedData }),
    })
  );

/**
 * Convert an encoded-compatible payload to the normalized runtime violation model.
 *
 * @since 0.0.0
 * @category Utility
 */
export const toRuleViolation = (payload: RuleViolationPayload): RuleViolation =>
  makeRuleViolation(
    payload.kind,
    payload.messageId,
    O.fromNullishOr(payload.data).pipe(O.getOrElse(R.empty<string, string>))
  );
