/**
 * Contact form submission contracts for OPIP intake.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OpipWebId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $OpipWebId.create("contact/ContactSubmission.model");

/**
 * Public contact submission status.
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
 * @category models
 * @since 0.0.0
 */
export type ContactSubmissionStatus = typeof ContactSubmissionStatus.Type;

/**
 * Browser-submitted OPIP contact form payload.
 *
 * @category models
 * @since 0.0.0
 */
export class ContactSubmission extends S.Class<ContactSubmission>($I`ContactSubmission`)(
  {
    company: S.optionalKey(S.String),
    email: S.String,
    message: S.String,
    name: S.String,
    phone: S.optionalKey(S.String),
    posture: S.optionalKey(S.String),
    submittedAt: S.Number,
    technology: S.optionalKey(S.String),
    website: S.optionalKey(S.String),
  },
  $I.annote("ContactSubmission", {
    description: "Browser-submitted OPIP contact form payload.",
  })
) {}

/**
 * Public contact submission response.
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
 * @category utilities
 * @since 0.0.0
 */
export const decodeContactSubmission = S.decodeUnknownEffect(ContactSubmission);
