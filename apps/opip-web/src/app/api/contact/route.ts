/**
 * OPIP contact intake route.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect } from "effect";
import * as P from "effect/Predicate";
import { type NextRequest, NextResponse } from "next/server";
import { type ContactSubmissionResponse, contactResponseBody, submitContact } from "../../../contact";

const submittedAtValue = (value: FormDataEntryValue | null) => {
  if (!P.isString(value)) {
    return 0;
  }

  const submittedAt = Number(value);

  return Number.isFinite(submittedAt) ? submittedAt : 0;
};

const formTextValue = (value: FormDataEntryValue | null) => (P.isString(value) ? value : undefined);

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
 * @category constructors
 * @since 0.0.0
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isJsonSubmission = contentType.includes("application/json");
  const payload = isJsonSubmission ? await request.json() : formDataPayload(await request.formData());
  const response = await Effect.runPromise(submitContact(payload));

  if (!isJsonSubmission) {
    return redirectToContact(request, response);
  }

  return NextResponse.json(contactResponseBody(response), {
    status: response.status === "accepted" ? 202 : 400,
  });
}
