import { $I as $RootId } from "@beep/identity/packages";
import {
  SidecarBadRequest,
  SidecarBadRequestPayload,
  SidecarBootstrap,
  SidecarInternalError,
  SidecarInternalErrorPayload,
  SidecarNotFound,
  SidecarNotFoundPayload,
} from "@beep/runtime-protocol";
import * as S from "effect/Schema";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import {
  CompleteVt2CaptureInput,
  CreateVt2SessionInput,
  ResolveVt2RecoveryCandidateInput,
  RunVt2CompositionInput,
  UpdateVt2DesktopPreferencesInput,
  Vt2DesktopPreferences,
  Vt2RecoveryCandidateParams,
  Vt2Session,
  Vt2SessionIdParams,
  Vt2SessionResource,
  Vt2WorkspaceSnapshot,
} from "./domain.js";

const $I = $RootId.create("VT2/protocol");

/**
 * @since 0.0.0
 * @category Re-exports
 */
export * from "@beep/runtime-protocol";

/**
 * Union of deterministic V2T control-plane payload errors.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2ControlPlaneErrorPayload = S.Union([
  SidecarBadRequestPayload,
  SidecarNotFoundPayload,
  SidecarInternalErrorPayload,
]).annotate(
  $I.annote("Vt2ControlPlaneErrorPayload", {
    description: "Union of deterministic error payloads returned by the V2T control plane.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2ControlPlaneErrorPayload = typeof Vt2ControlPlaneErrorPayload.Type;

/**
 * Union of deterministic status-aware V2T resource errors.
 *
 * @since 0.0.0
 * @category Integration
 */
export const Vt2ControlPlaneResourceError = S.Union([SidecarBadRequest, SidecarNotFound, SidecarInternalError]).annotate(
  $I.annote("Vt2ControlPlaneResourceError", {
    description: "Union of deterministic status-aware resource errors returned by the V2T control plane.",
  })
);
/**
 * @since 0.0.0
 * @category Integration
 */
export type Vt2ControlPlaneResourceError = typeof Vt2ControlPlaneResourceError.Type;

const Vt2SessionResourceCreated = Vt2SessionResource.pipe(HttpApiSchema.status(201));

class SystemGroup extends HttpApiGroup.make("system", { topLevel: true }).add(
  HttpApiEndpoint.get("health", "/health", {
    success: SidecarBootstrap,
    error: SidecarInternalError,
  })
) {}

class WorkspaceGroup extends HttpApiGroup.make("workspace", { topLevel: true })
  .add(
    HttpApiEndpoint.get("getWorkspace", "/workspace", {
      success: Vt2WorkspaceSnapshot,
      error: SidecarInternalError,
    })
  )
  .add(
    HttpApiEndpoint.get("getPreferences", "/preferences", {
      success: Vt2DesktopPreferences,
      error: SidecarInternalError,
    })
  )
  .add(
    HttpApiEndpoint.put("savePreferences", "/preferences", {
      payload: UpdateVt2DesktopPreferencesInput,
      success: Vt2DesktopPreferences,
      error: S.Union([SidecarBadRequest, SidecarInternalError]),
    })
  ) {}

class SessionsGroup extends HttpApiGroup.make("sessions", { topLevel: true })
  .add(
    HttpApiEndpoint.get("listSessions", "/sessions", {
      success: S.Array(Vt2Session),
      error: SidecarInternalError,
    })
  )
  .add(
    HttpApiEndpoint.get("getSession", "/sessions/:sessionId", {
      params: Vt2SessionIdParams,
      success: Vt2SessionResource,
      error: Vt2ControlPlaneResourceError,
    })
  )
  .add(
    HttpApiEndpoint.post("createSession", "/sessions", {
      payload: CreateVt2SessionInput,
      success: Vt2SessionResourceCreated,
      error: S.Union([SidecarBadRequest, SidecarInternalError]),
    })
  )
  .add(
    HttpApiEndpoint.post("startCapture", "/sessions/:sessionId/capture/start", {
      params: Vt2SessionIdParams,
      success: Vt2SessionResource,
      error: Vt2ControlPlaneResourceError,
    })
  )
  .add(
    HttpApiEndpoint.post("completeCapture", "/sessions/:sessionId/capture/complete", {
      params: Vt2SessionIdParams,
      payload: CompleteVt2CaptureInput,
      success: Vt2SessionResource,
      error: Vt2ControlPlaneResourceError,
    })
  )
  .add(
    HttpApiEndpoint.post("resolveRecoveryCandidate", "/sessions/:sessionId/recovery/:candidateId", {
      params: Vt2RecoveryCandidateParams,
      payload: ResolveVt2RecoveryCandidateInput,
      success: Vt2SessionResource,
      error: Vt2ControlPlaneResourceError,
    })
  )
  .add(
    HttpApiEndpoint.post("runComposition", "/sessions/:sessionId/composition/run", {
      params: Vt2SessionIdParams,
      payload: RunVt2CompositionInput,
      success: Vt2SessionResource,
      error: Vt2ControlPlaneResourceError,
    })
  ) {}

/**
 * VT2 control-plane HTTP API.
 *
 * @since 0.0.0
 * @category Integration
 */
export class Vt2ControlPlaneApi extends HttpApi.make("vt2-control-plane")
  .add(SystemGroup, WorkspaceGroup, SessionsGroup)
  .prefix("/api/v0") {}
