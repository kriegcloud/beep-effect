/**
 * CanvasProject HTTP handlers.
 *
 * @packageDocumentation
 * @category handlers
 * @since 0.0.0
 */

import { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public";
import { $CanvasServerId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Effect, flow, Match } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $CanvasServerId.create("aggregates/CanvasProject/CanvasProject.http");

/**
 * HTTP status values emitted by the CanvasProject bootstrap adapter.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-server"
 * import * as S from "effect/Schema"
 *
 * const decodeStatus = S.decodeUnknownEffect(CanvasProject.CanvasProjectHttpStatus)
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export const CanvasProjectHttpStatus = LiteralKit([200, 201, 404, 409, 422, 503]).pipe(
  $I.annoteSchema("CanvasProjectHttpStatus", {
    title: "CanvasProject HTTP status",
    description: "HTTP status vocabulary emitted by the CanvasProject bootstrap protocol adapter.",
  })
);

/**
 * Runtime type for {@link CanvasProjectHttpStatus}.
 *
 * @example
 * ```ts
 * import type { CanvasProject } from "@beep/canvas-server"
 *
 * const status: CanvasProject.CanvasProjectHttpStatus = 200
 * console.log(status)
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export type CanvasProjectHttpStatus = typeof CanvasProjectHttpStatus.Type;

/**
 * Minimal HTTP response envelope used by the canvas bootstrap proof.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-server"
 *
 * const response = CanvasProject.CanvasProjectHttpResponse.make({ status: 200, body: { ok: true } })
 * console.log(response.status)
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export class CanvasProjectHttpResponse extends S.Class<CanvasProjectHttpResponse>($I`CanvasProjectHttpResponse`)(
  {
    body: S.Unknown,
    status: CanvasProjectHttpStatus,
  },
  $I.annote("CanvasProjectHttpResponse", {
    title: "CanvasProject HTTP response",
    description: "Minimal protocol response envelope used by the canvas bootstrap proof.",
  })
) {
  static readonly new: {
    (body: unknown, status: CanvasProjectHttpStatus): CanvasProjectHttpResponse;
    (status: CanvasProjectHttpStatus): (body: unknown) => CanvasProjectHttpResponse;
  } = dual(
    2,
    (body: unknown, status: CanvasProjectHttpStatus): CanvasProjectHttpResponse =>
      CanvasProjectHttpResponse.make({
        body,
        status,
      })
  );
}

/**
 * Convert a public CanvasProject failure to an HTTP response envelope.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-server"
 * import { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"
 *
 * const response = CanvasProject.toCanvasProjectHttpError(
 *   CanvasProjectUseCases.CanvasProjectActionFailed.make({
 *     reason: CanvasProjectUseCases.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON,
 *   })
 * )
 * console.log(response.status)
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export const toCanvasProjectHttpError = Match.type<CanvasProjectUseCases.CanvasProjectActionError>().pipe(
  Match.tags({
    CanvasProjectNotFound: CanvasProjectHttpResponse.new(404),
    CanvasProjectConflict: CanvasProjectHttpResponse.new(409),
    CanvasProjectActionRejected: CanvasProjectHttpResponse.new(422),
  }),
  Match.orElse(() => CanvasProjectHttpResponse.new(CanvasProjectUseCases.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON, 503))
);

const toSuccess =
  (status: 200 | 201) =>
  (body: unknown): CanvasProjectHttpResponse =>
    CanvasProjectHttpResponse.make({ status, body });

/**
 * Build HTTP-style CanvasProject handlers from the public use-case facade.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-server"
 * import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"
 *
 * declare const useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape
 * const handlers = CanvasProject.makeCanvasProjectHttpHandlers(useCases)
 * console.log(Object.keys(handlers))
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export const makeCanvasProjectHttpHandlers = (useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape) => ({
  addNode: flow(
    useCases.addNode,
    Effect.match({
      onFailure: toCanvasProjectHttpError,
      onSuccess: CanvasProjectHttpResponse.new(200),
    })
  ),
  archive: flow(
    useCases.archive,
    Effect.match({
      onFailure: toCanvasProjectHttpError,
      onSuccess: CanvasProjectHttpResponse.new(200),
    })
  ),
  create: flow(
    useCases.create,
    Effect.match({
      onFailure: toCanvasProjectHttpError,
      onSuccess: CanvasProjectHttpResponse.new(201),
    })
  ),
  get: flow(
    useCases.get,
    Effect.match({
      onFailure: toCanvasProjectHttpError,
      onSuccess: CanvasProjectHttpResponse.new(200),
    })
  ),
  list: flow(
    useCases.list,
    Effect.match({
      onFailure: toCanvasProjectHttpError,
      onSuccess: CanvasProjectHttpResponse.new(200),
    })
  ),
  removeNode: flow(
    useCases.removeNode,
    Effect.match({
      onFailure: toCanvasProjectHttpError,
      onSuccess: CanvasProjectHttpResponse.new(200),
    })
  ),
  restore: flow(
    useCases.restore,
    Effect.match({
      onFailure: toCanvasProjectHttpError,
      onSuccess: toSuccess(200),
    })
  ),
});
