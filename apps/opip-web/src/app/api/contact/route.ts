/**
 * OPIP contact intake route.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Str } from "@beep/utils";
import { Effect, Exit } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { type NextRequest, NextResponse } from "next/server";
import { ContactSubmissionResponse, contactResponseBody, submitContact } from "../../../contact";

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

const redirectToContact = (request: NextRequest, response: ContactSubmissionResponse) => {
  const url = new URL("/", request.url);
  url.hash = "contact";
  url.searchParams.set("contact", response.status);

  return NextResponse.redirect(url, 303);
};

/**
 * Handles OPIP contact submissions.
 *
 * @example
 * ```ts
 * import type { NextRequest } from "next/server"
 * import { POST } from "@beep/opip-web/app/api/contact/route"
 *
 * const handler: (request: NextRequest) => Promise<Response> = POST
 * console.log(typeof handler)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isJsonSubmission = Str.includes("application/json")(contentType);
  const payload = isJsonSubmission ? await request.json() : formDataPayload(await request.formData());
  const exit = await Effect.runPromiseExit(submitContact(payload));
  const response = Exit.isSuccess(exit) ? exit.value : rejected;

  if (!isJsonSubmission) {
    return redirectToContact(request, response);
  }

  return NextResponse.json(contactResponseBody(response), {
    status: Exit.isFailure(exit) ? 500 : response.status === "accepted" ? 202 : 400,
  });
}
