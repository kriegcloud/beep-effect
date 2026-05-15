/**
 * Contact form submission contracts for OPIP intake.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OpipWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { SchemaTransformation } from "effect";
import * as S from "effect/Schema";

const $I = $OpipWebId.create("contact/ContactSubmission.model");

const contactEmailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const TrimmedContactText = S.NonEmptyString.pipe(
  S.decode(SchemaTransformation.trim()),
  S.annotate(
    $I.annote("TrimmedContactText", {
      description: "Trimmed non-empty contact form text.",
    })
  )
);

const ContactName = TrimmedContactText.check(
  S.isMinLength(2, {
    message: "Name must include at least 2 characters.",
  })
).pipe(
  S.annotate(
    $I.annote("ContactName", {
      description: "Normalized contact form name.",
    })
  )
);

const ContactEmail = TrimmedContactText.pipe(S.decode(SchemaTransformation.toLowerCase()))
  .check(
    S.isMaxLength(254, {
      message: "Email must be 254 characters or fewer.",
    }),
    S.isPattern(contactEmailPattern, {
      message: "Email must be a valid email address.",
    })
  )
  .pipe(
    S.annotate(
      $I.annote("ContactEmail", {
        description: "Normalized contact form email address.",
      })
    )
  );

const ContactMessage = TrimmedContactText.check(
  S.isMinLength(10, {
    message: "Message must include at least 10 characters.",
  })
).pipe(
  S.annotate(
    $I.annote("ContactMessage", {
      description: "Normalized contact form message.",
    })
  )
);

/**
 * Public contact submission status.
 *
 * @example
 * ```ts
 * import { ContactSubmissionStatus } from "@beep/opip-web/contact"
 *
 * const accepted = ContactSubmissionStatus.Enum.accepted
 * console.log(accepted)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ContactSubmissionStatus = LiteralKit(["accepted", "rejected"] as const).annotate(
  $I.annote("ContactSubmissionStatus", {
    description: "Public contact submission result status.",
  })
);

/**
 * Type for {@link ContactSubmissionStatus}.
 *
 * @example
 * ```ts
 * import type { ContactSubmissionStatus } from "@beep/opip-web/contact"
 *
 * const status: ContactSubmissionStatus = "accepted"
 * console.log(status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ContactSubmissionStatus = typeof ContactSubmissionStatus.Type;

/**
 * Browser-submitted OPIP contact form payload.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ContactSubmission } from "@beep/opip-web/contact"
 *
 * const submission = S.decodeUnknownSync(ContactSubmission)({
 *   email: "builder@example.com",
 *   message: "I would like to discuss a patent matter.",
 *   name: "Builder",
 *   submittedAt: 0
 * })
 *
 * console.log(submission.email)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ContactSubmission extends S.Class<ContactSubmission>($I`ContactSubmission`)(
  {
    company: S.optionalKey(TrimmedContactText),
    email: ContactEmail,
    message: ContactMessage,
    name: ContactName,
    phone: S.optionalKey(TrimmedContactText),
    posture: S.optionalKey(TrimmedContactText),
    submittedAt: NonNegativeInt,
    technology: S.optionalKey(TrimmedContactText),
    website: S.optionalKey(TrimmedContactText),
  },
  $I.annote("ContactSubmission", {
    description: "Browser-submitted OPIP contact form payload.",
  })
) {}

/**
 * Public contact submission response.
 *
 * @example
 * ```ts
 * import { ContactSubmissionResponse } from "@beep/opip-web/contact"
 *
 * const response = new ContactSubmissionResponse({
 *   message: "Your note was received.",
 *   status: "accepted"
 * })
 *
 * console.log(response.status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ContactSubmissionResponse extends S.Class<ContactSubmissionResponse>($I`ContactSubmissionResponse`)(
  {
    message: S.String,
    status: ContactSubmissionStatus,
  },
  $I.annote("ContactSubmissionResponse", {
    description: "Public contact submission response.",
  })
) {}

/**
 * Decodes unknown input into a contact submission.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { decodeContactSubmission } from "@beep/opip-web/contact"
 *
 * const program = decodeContactSubmission({
 *   email: "builder@example.com",
 *   message: "I would like to discuss a patent matter.",
 *   name: "Builder",
 *   submittedAt: 0
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const decodeContactSubmission = S.decodeUnknownEffect(ContactSubmission);
