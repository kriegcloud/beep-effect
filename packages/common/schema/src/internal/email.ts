import { $SchemaId } from "@beep/identity/packages";
import { Schema as S, SchemaTransformation } from "effect";

const $I = $SchemaId.create("Email");

// --- Regex ---

export const emailRegex: RegExp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

// --- Normalization base ---

const NormalizedString = S.NonEmptyString.pipe(
  S.decode(SchemaTransformation.trim()),
  S.decode(SchemaTransformation.toLowerCase())
);

// --- Filter group ---

const emailChecks = S.makeFilterGroup([
  S.isNonEmpty({ message: "Email cannot be empty" }),
  S.isTrimmed({ message: "Email must be trimmed" }),
  S.isLowercased({ message: "Email must be lowercase" }),
  S.isMaxLength(254, { message: "Email must not exceed 254 characters" }),
  S.isPattern(emailRegex, { message: "Invalid email format" }),
]);

// --- Branded Email ---

const EmailBranded = NormalizedString.check(emailChecks).pipe(S.brand("Email"));

// --- Final schema: branded + redacted + annotated ---

export const Email = S.RedactedFromValue(EmailBranded, { label: "Email" }).pipe(
  S.annotate($I.annote("Email", { description: "RFC 5322 compliant email address" }))
);

export type Email = typeof Email.Type;
