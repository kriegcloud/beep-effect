import { $SharedDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("api/v1/rpc-reference");

/**
 * Documentation-only endpoint that describes the RPC WebSocket endpoint.
 * This is NOT a functional REST endpoint - it exists purely to document
 * the RPC system in the OpenAPI/Scalar UI.
 *
 * The actual RPC endpoint is a WebSocket connection at:
 * - ws://localhost:8080/v1/shared/rpc (for shared RPCs)
 * - ws://localhost:8080/v1/documents/rpc (for document RPCs)
 *
 * RPC endpoints support bidirectional streaming and are not REST-compatible.
 */

export class RpcInfo extends S.Class<RpcInfo>($I`RpcInfo`)(
  {
    protocol: S.Literal("websocket"),
    path: S.String,
    serialization: S.Literal("ndjson"),
    description: S.String,
    availableRpcs: S.Array(S.String),
  },
  $I.annotations("RpcInfo", {
    description: "Information about available RPC endpoints (WebSocket-based, not REST)",
  })
) {}

export class SharedRpcInfo extends S.Class<SharedRpcInfo>($I`SharedRpcInfo`)(
  {
    shared: RpcInfo,
    documents: RpcInfo,
  },
  $I.annotations("SharedRpcInfo", {
    description:
      "RPC endpoint information. Note: These are WebSocket endpoints and cannot be called via REST. Use the RPC client for actual communication.",
  })
) {}

/**
 * Documentation endpoint that returns information about available RPC endpoints.
 * This helps users discover RPC capabilities through the REST API docs.
 */
export const GetRpcInfo = HttpApiEndpoint.get("rpc-info", "/rpc/info").addSuccess(
  SharedRpcInfo.annotations(
    $I.annotations("GetRpcInfoSuccess", {
      description:
        "Returns metadata about available RPC endpoints. These endpoints use WebSocket protocol with NDJSON serialization and are NOT accessible via REST.",
    })
  )
);

export class Group extends HttpApiGroup.make("shared.rpc").add(GetRpcInfo).prefix("/shared") {}
