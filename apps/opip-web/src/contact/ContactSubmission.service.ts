/**
 * Server-side OPIP contact submission workflow.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  HubSpot,
  HubSpotConfigInput,
  HubSpotFormField,
  HubSpotSubmitFormRequest,
  HubSpotUpsertContactRequest,
} from "@beep/hubspot";
import { Clock, Effect, flow, Layer, pipe, Redacted } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FetchHttpClient } from "effect/unstable/http";
import { type ContactSubmission, ContactSubmissionResponse, decodeContactSubmission } from "./ContactSubmission.model";

const minimumElapsedMs = 3_000;

const envOption = (key: string): O.Option<string> =>
  pipe(process.env[key], O.fromUndefinedOr, O.map(Str.trim), O.filter(Str.isNonEmpty));

const firstEnvOption: (keys: ReadonlyArray<string>) => O.Option<string> = flow(
  A.findFirst(flow(envOption, O.isSome)),
  O.flatMap(envOption)
);

const hubSpotConfig = (): O.Option<{
  readonly config: HubSpotConfigInput;
  readonly formGuid: O.Option<string>;
}> => {
  const accountId = firstEnvOption(["CRM_HUBSPOT_ACCOUNT_ID", "HUBSPOT_ACCOUNT_ID"]);
  const accessToken = firstEnvOption(["CRM_HUBSPOT_SERVICE_KEY", "HUBSPOT_SERVICE_KEY"]);
  const formGuid = firstEnvOption(["CRM_HUBSPOT_FORM_GUID", "HUBSPOT_FORM_GUID"]);

  if (O.isNone(accountId) || O.isNone(accessToken)) {
    return O.none();
  }

  return O.some({
    config: new HubSpotConfigInput({
      accountId: accountId.value,
      accessToken: Redacted.make(accessToken.value),
    }),
    formGuid,
  });
};

const textField = (name: string, value: O.Option<string>): ReadonlyArray<HubSpotFormField> =>
  pipe(
    value,
    O.map(Str.trim),
    O.filter(Str.isNonEmpty),
    O.match({
      onNone: A.empty,
      onSome: (fieldValue) => [new HubSpotFormField({ name, value: fieldValue })],
    })
  );

const submissionFields = (submission: ContactSubmission): ReadonlyArray<HubSpotFormField> =>
  A.flatten([
    textField("email", O.some(submission.email)),
    textField("firstname", O.some(submission.name)),
    textField("company", O.fromUndefinedOr(submission.company)),
    textField("phone", O.fromUndefinedOr(submission.phone)),
    textField("message", O.some(submission.message)),
    textField("technology", O.fromUndefinedOr(submission.technology)),
    textField("posture", O.fromUndefinedOr(submission.posture)),
  ]);

const noteLine = (label: string, value: O.Option<string>): ReadonlyArray<string> =>
  pipe(
    value,
    O.map(Str.trim),
    O.filter(Str.isNonEmpty),
    O.match({
      onNone: A.empty,
      onSome: (fieldValue) => [`${label}: ${fieldValue}`],
    })
  );

const crmMessage = (submission: ContactSubmission): string =>
  pipe(
    A.flatten([
      [`Message:\n${submission.message}`],
      noteLine("Technology", O.fromUndefinedOr(submission.technology)),
      noteLine("Relationship", O.fromUndefinedOr(submission.posture)),
    ]),
    A.join("\n\n")
  );

const contactProperties = (submission: ContactSubmission): Readonly<Record<string, string>> => ({
  email: submission.email,
  firstname: submission.name,
  message: crmMessage(submission),
  ...(submission.company === undefined ? {} : { company: submission.company }),
  ...(submission.phone === undefined ? {} : { phone: submission.phone }),
});

const accepted = new ContactSubmissionResponse({
  message: "Your note was received.",
  status: "accepted",
});

const rejected = new ContactSubmissionResponse({
  message: "The submission could not be accepted.",
  status: "rejected",
});

const isContactSubmissionResponse = S.is(ContactSubmissionResponse);

const validateSpamControls = Effect.fn("OpipContact.validateSpamControls")(function* (
  submission: ContactSubmission
): Effect.fn.Return<void, ContactSubmissionResponse> {
  const honeypot = pipe(O.fromUndefinedOr(submission.website), O.map(Str.trim), O.filter(Str.isNonEmpty));
  const now = yield* Clock.currentTimeMillis;
  const elapsedMs = now - submission.submittedAt;

  if (O.isSome(honeypot)) {
    return yield* Effect.fail(rejected);
  }

  if (elapsedMs < minimumElapsedMs) {
    return yield* Effect.fail(rejected);
  }

  return undefined;
});

const submitConfiguredContact = (
  settings: {
    readonly config: HubSpotConfigInput;
    readonly formGuid: O.Option<string>;
  },
  submission: ContactSubmission
) =>
  Effect.gen(function* () {
    const hubspot = yield* HubSpot;
    if (O.isSome(settings.formGuid)) {
      return yield* hubspot.submitForm(
        new HubSpotSubmitFormRequest({
          fields: submissionFields(submission),
          formGuid: settings.formGuid.value,
          submittedAt: submission.submittedAt,
          context: {
            pageName: "opip.law contact",
            pageUri: "https://opip.law/#contact",
          },
        })
      );
    }

    return yield* hubspot.upsertContact(
      new HubSpotUpsertContactRequest({
        email: submission.email,
        objectWriteTraceId: "opip-contact-form",
        properties: contactProperties(submission),
      })
    );
  }).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(HubSpot.makeLayer(settings.config).pipe(Layer.provide(FetchHttpClient.layer)))
  );

/**
 * Submits an OPIP contact payload to HubSpot when runtime config is present.
 *
 * @category workflows
 * @since 0.0.0
 */
export const submitContact = (input: unknown): Effect.Effect<ContactSubmissionResponse> =>
  Effect.gen(function* () {
    const submission = yield* decodeContactSubmission(input).pipe(Effect.mapError(() => rejected));
    yield* validateSpamControls(submission);

    const settings = hubSpotConfig();
    if (O.isNone(settings)) {
      return yield* Effect.fail(
        new ContactSubmissionResponse({
          message: "Contact intake is not configured.",
          status: "rejected",
        })
      );
    }

    yield* submitConfiguredContact(settings.value, submission);

    return accepted;
  }).pipe(Effect.catch((error) => Effect.succeed(isContactSubmissionResponse(error) ? error : rejected)));

/**
 * Builds a JSON-safe contact response object.
 *
 * @category utilities
 * @since 0.0.0
 */
export const contactResponseBody = (response: ContactSubmissionResponse): typeof ContactSubmissionResponse.Encoded => ({
  message: response.message,
  status: response.status,
});
