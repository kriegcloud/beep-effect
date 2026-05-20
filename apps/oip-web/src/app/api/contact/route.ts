/**
 * OIP contact intake route.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Str } from "@beep/utils";
import { Effect, Exit } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { NextResponse } from "next/server";
import { ContactSubmissionResponse, contactResponseBody, submitContact } from "../../../contact";

type SubmitContact = (payload: unknown) => Effect.Effect<ContactSubmissionResponse>;

const rejected = new ContactSubmissionResponse({
  message: "The submission could not be accepted.",
  status: "rejected",
});

const submittedAtValue = (value: FormDataEntryValue | null) => {
  if (!P.isString(value)) {
    return 0;
  }

  const submittedAt = Number(value);

  return Number.isFinite(submittedAt) ? submittedAt : 0;
};

const formTextValue = (value: FormDataEntryValue | null) =>
  O.getOrUndefined(O.filter(O.map(O.filter(O.fromNullishOr(value), P.isString), Str.trim), Str.isNonEmpty));

const formDataPayload = (formData: FormData) => ({
  company: formTextValue(formData.get("company")),
  email: formTextValue(formData.get("email")),
  message: formTextValue(formData.get("message")),
  name: formTextValue(formData.get("name")),
  phone: formTextValue(formData.get("phone")),
  posture: formTextValue(formData.get("posture")),
  submittedAt: submittedAtValue(formData.get("submittedAt")),
  technology: formTextValue(formData.get("technology")),
  website: formTextValue(formData.get("website")),
});

const redirectToContact = (request: Request, response: ContactSubmissionResponse) => {
  const url = new URL("/", request.url);
  url.hash = "contact";
  url.searchParams.set("contact", response.status);

  return NextResponse.redirect(url, 303);
};

/**
 * Builds an OIP contact route response using an injected contact workflow.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import {
 *   contactRequestResponseWithSubmit,
 * } from "@beep/oip-web/app/api/contact/route"
 *
 * const request = new Request("https://oip.law/api/contact", { method: "POST" })
 * const submit = () => Effect.succeed({ message: "Received.", status: "accepted" as const })
 * const program = contactRequestResponseWithSubmit(request, submit)
 *
 * Effect.runPromise(program)
 * ```
 *
 * @effects Reads request bodies and delegates contact submission to the supplied
 * workflow before creating JSON or redirect responses.
 * @category workflows
 * @since 0.0.0
 */
export const contactRequestResponseWithSubmit: {
  (request: Request, submit: SubmitContact): Effect.Effect<NextResponse>;
  (submit: SubmitContact): (request: Request) => Effect.Effect<NextResponse>;
} = dual(
  2,
  Effect.fn("OipContact.contactRequestResponseWithSubmit")(function* (request: Request, submit: SubmitContact) {
    const contentType = request.headers.get("content-type") ?? "";
    const isJsonSubmission = Str.includes("application/json")(contentType);
    const payload = yield* Effect.promise(() =>
      isJsonSubmission ? request.json() : request.formData().then(formDataPayload)
    );
    const exit = yield* Effect.exit(submit(payload));
    const response = Exit.isSuccess(exit) ? exit.value : rejected;

    if (!isJsonSubmission) {
      return redirectToContact(request, response);
    }

    return NextResponse.json(contactResponseBody(response), {
      status: Exit.isFailure(exit) ? 500 : response.status === "accepted" ? 202 : 400,
    });
  })
);

/**
 * Builds an OIP contact route response inside an Effect runtime.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { contactRequestResponse } from "@beep/oip-web/app/api/contact/route"
 *
 * const request = new Request("https://oip.law/api/contact", { method: "POST" })
 * const program = contactRequestResponse(request)
 *
 * Effect.runPromise(program)
 * ```
 *
 * @effects Reads request bodies, submits contact payloads, and creates JSON or
 * redirect responses.
 * @category workflows
 * @since 0.0.0
 */
export const contactRequestResponse: (request: Request) => Effect.Effect<NextResponse> = Effect.fn(
  "OipContact.contactRequestResponse"
)((request: Request) => contactRequestResponseWithSubmit(request, submitContact));

/**
 * Handles OIP contact submissions at the Next.js route boundary.
 *
 * @example
 * ```ts
 * import { POST } from "@beep/oip-web/app/api/contact/route"
 *
 * const handler: (request: Request) => Promise<Response> = POST
 * console.log(typeof handler)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function POST(request: Request): Promise<NextResponse> {
  return Effect.runPromise(contactRequestResponse(request));
}
