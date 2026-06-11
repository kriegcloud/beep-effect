/**
 * OIP contact intake route.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Str } from "@beep/utils";
import { Effect } from "effect";
import * as S from "effect/Schema";
import { ContactSubmissionPayload, ContactSubmissionResponse, contactResponseBody } from "../../../contact";
import { oipContactHttpApiWebHandler } from "./ContactHttpApiRoute";
import { contactRequestResponse } from "./ContactRouteResponse";

const isJsonContactSubmission = (request: Request): boolean =>
  Str.includes("application/json")(request.headers.get("content-type") ?? "");

const decodeJsonContactSubmissionPayload = S.decodeUnknownEffect(ContactSubmissionPayload);

const rejectedContactSubmission = ContactSubmissionResponse.make({
  message: "The submission could not be accepted.",
  status: "rejected",
});

const contactJsonStatus = (response: ContactSubmissionResponse): 202 | 400 =>
  response.status === "accepted" ? 202 : 400;

const readJsonContactPayload = Effect.fn("OipContact.readJsonContactPayload")(function* (request: Request) {
  const body = yield* Effect.tryPromise({
    try: () => request.json(),
    catch: () => rejectedContactSubmission,
  });

  return yield* decodeJsonContactSubmissionPayload(body).pipe(Effect.mapError(() => rejectedContactSubmission));
});

const rejectedJsonContactResponse = (response: ContactSubmissionResponse): Response =>
  Response.json(contactResponseBody(response), { status: contactJsonStatus(response) });

const jsonContactResponse = (request: Request): Effect.Effect<Response> =>
  readJsonContactPayload(request.clone()).pipe(
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: () => oipContactHttpApiWebHandler(request),
        catch: () => rejectedContactSubmission,
      })
    ),
    Effect.catch((response) => Effect.succeed(rejectedJsonContactResponse(response)))
  );

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
export const POST: (request: Request) => Promise<Response> = (request) =>
  Effect.runPromise(isJsonContactSubmission(request) ? jsonContactResponse(request) : contactRequestResponse(request));
