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
import { Effect, Match } from "effect";
import * as S from "effect/Schema";

const $I = $CanvasServerId.create("aggregates/CanvasProject/CanvasProject.http");

const isNotFound = S.is(CanvasProjectUseCases.CanvasProjectNotFound);
const isConflict = S.is(CanvasProjectUseCases.CanvasProjectConflict);
const isActionRejected = S.is(CanvasProjectUseCases.CanvasProjectActionRejected);
const isActionFailed = S.is(CanvasProjectUseCases.CanvasProjectActionFailed);
const serviceUnavailableBody = new CanvasProjectUseCases.CanvasProjectActionFailed({
  reason: CanvasProjectUseCases.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON,
});

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
export const CanvasProjectHttpStatus = LiteralKit([200, 201, 404, 409, 422, 503] as const).pipe(
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
 * const response = new CanvasProject.CanvasProjectHttpResponse({ status: 200, body: { ok: true } })
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
) {}

/**
 * Convert a public CanvasProject failure to an HTTP response envelope.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-server"
 * import { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"
 *
 * const response = CanvasProject.toCanvasProjectHttpError(
 *   new CanvasProjectUseCases.CanvasProjectActionFailed({
 *     reason: CanvasProjectUseCases.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON,
 *   })
 * )
 * console.log(response.status)
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export const toCanvasProjectHttpError = (
  error: CanvasProjectUseCases.CanvasProjectActionError
): CanvasProjectHttpResponse =>
  Match.value(error).pipe(
    Match.when(isNotFound, (error) => new CanvasProjectHttpResponse({ status: 404, body: error })),
    Match.when(isConflict, (error) => new CanvasProjectHttpResponse({ status: 409, body: error })),
    Match.when(isActionRejected, (error) => new CanvasProjectHttpResponse({ status: 422, body: error })),
    Match.when(isActionFailed, () => new CanvasProjectHttpResponse({ status: 503, body: serviceUnavailableBody })),
    Match.orElse(() => new CanvasProjectHttpResponse({ status: 503, body: serviceUnavailableBody }))
  );

const toSuccess =
  (status: 200 | 201) =>
  (body: unknown): CanvasProjectHttpResponse =>
    new CanvasProjectHttpResponse({ status, body });

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
  addNode: (command: CanvasProjectUseCases.AddCanvasNodeCommand): Effect.Effect<CanvasProjectHttpResponse> =>
    useCases.addNode(command).pipe(
      Effect.match({
        onFailure: toCanvasProjectHttpError,
        onSuccess: toSuccess(200),
      })
    ),
  archive: (command: CanvasProjectUseCases.ArchiveCanvasProjectCommand): Effect.Effect<CanvasProjectHttpResponse> =>
    useCases.archive(command).pipe(
      Effect.match({
        onFailure: toCanvasProjectHttpError,
        onSuccess: toSuccess(200),
      })
    ),
  create: (command: CanvasProjectUseCases.CreateCanvasProjectCommand): Effect.Effect<CanvasProjectHttpResponse> =>
    useCases.create(command).pipe(
      Effect.match({
        onFailure: toCanvasProjectHttpError,
        onSuccess: toSuccess(201),
      })
    ),
  get: (query: CanvasProjectUseCases.GetCanvasProjectQuery): Effect.Effect<CanvasProjectHttpResponse> =>
    useCases.get(query).pipe(
      Effect.match({
        onFailure: toCanvasProjectHttpError,
        onSuccess: toSuccess(200),
      })
    ),
  list: (query: CanvasProjectUseCases.ListCanvasProjectsQuery): Effect.Effect<CanvasProjectHttpResponse> =>
    useCases.list(query).pipe(
      Effect.match({
        onFailure: toCanvasProjectHttpError,
        onSuccess: toSuccess(200),
      })
    ),
  removeNode: (command: CanvasProjectUseCases.RemoveCanvasNodeCommand): Effect.Effect<CanvasProjectHttpResponse> =>
    useCases.removeNode(command).pipe(
      Effect.match({
        onFailure: toCanvasProjectHttpError,
        onSuccess: toSuccess(200),
      })
    ),
  restore: (command: CanvasProjectUseCases.RestoreCanvasProjectCommand): Effect.Effect<CanvasProjectHttpResponse> =>
    useCases.restore(command).pipe(
      Effect.match({
        onFailure: toCanvasProjectHttpError,
        onSuccess: toSuccess(200),
      })
    ),
});
