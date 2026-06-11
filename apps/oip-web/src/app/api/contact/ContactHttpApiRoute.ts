/**
 * Effect HttpApi server route bridge for OIP contact intake.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect, Layer } from "effect";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { ContactSubmissionAccepted, ContactSubmissionRejected, OipHttpApi } from "../../../contact";
import type { ContactSubmissionPayload, ContactSubmissionResponse } from "../../../contact";

type SubmitContact = (payload: ContactSubmissionPayload) => Effect.Effect<ContactSubmissionResponse>;

const contactHttpApiResponse = (
  response: ContactSubmissionResponse
): Effect.Effect<ContactSubmissionAccepted, ContactSubmissionRejected> =>
  response.status === "accepted"
    ? Effect.succeed(
        ContactSubmissionAccepted.make({
          message: response.message,
          status: response.status,
        })
      )
    : Effect.fail(
        ContactSubmissionRejected.make({
          message: response.message,
          status: response.status,
        })
      );

const makeOipContactHttpApiRouteLive = (submit: SubmitContact) =>
  HttpApiBuilder.group(OipHttpApi, "contact", (handlers) =>
    handlers.handle("submit", ({ payload }) => submit(payload).pipe(Effect.flatMap(contactHttpApiResponse)))
  );

/**
 * Server implementation layer for the OIP contact HttpApi group.
 *
 * @example
 * ```ts
 * import { OipContactHttpApiRouteLive } from "@beep/oip-web/app/api/contact/ContactHttpApiRoute"
 *
 * console.log(OipContactHttpApiRouteLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
// export const OipContactHttpApiRouteLive = makeOipContactHttpApiRouteLive(submitContact);

const makeOipContactHttpApiAppLayer = (submit: SubmitContact) =>
  HttpApiBuilder.layer(OipHttpApi).pipe(
    Layer.provideMerge(makeOipContactHttpApiRouteLive(submit)),
    Layer.provideMerge(HttpServer.layerServices)
  );

/**
 * Builds a Web-standard OIP contact handler with an injected submit workflow.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { makeOipContactHttpApiWebHandlerWithSubmit } from "@beep/oip-web/app/api/contact/ContactHttpApiRoute"
 *
 * const handler = makeOipContactHttpApiWebHandlerWithSubmit(() =>
 *   Effect.succeed({ message: "Your note was received.", status: "accepted" })
 * )
 *
 * console.log(typeof handler)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeOipContactHttpApiWebHandlerWithSubmit = (
  submit: SubmitContact
): ((request: Request) => Promise<Response>) =>
  HttpRouter.toWebHandler(makeOipContactHttpApiAppLayer(submit), { disableLogger: true }).handler;
