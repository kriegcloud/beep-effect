/**
 * OIP contact intake route.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Str } from "@beep/utils";
import { Effect } from "effect";
import { oipContactHttpApiWebHandler } from "./ContactHttpApiRoute";
import { contactRequestResponse } from "./ContactRouteResponse";

const isJsonContactSubmission = (request: Request): boolean =>
  Str.includes("application/json")(request.headers.get("content-type") ?? "");

const jsonRejectedContactSubmission = (): Response =>
  Response.json(
    {
      message: "The submission could not be accepted.",
      status: "rejected",
    },
    { status: 400 }
  );

const jsonContactResponse = async (request: Request): Promise<Response> => {
  const response = await oipContactHttpApiWebHandler(request);
  return response.status === 400 && response.headers.get("content-type") === null
    ? jsonRejectedContactSubmission()
    : response;
};

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
  isJsonContactSubmission(request) ? jsonContactResponse(request) : Effect.runPromise(contactRequestResponse(request));
