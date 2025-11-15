import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ApiKeyContractKit } from "./api-key.contracts";
import { apiKeyLayer } from "./api-key.implementations";

export class ApiKeyService extends Effect.Service<ApiKeyService>()("@beep/iam-sdk/clients/api-key/ApiKeyService", {
  dependencies: [apiKeyLayer],
  effect: ApiKeyContractKit.liftService(),
  accessors: true,
}) {
  static readonly Live = ApiKeyService.Default.pipe(Layer.provide(apiKeyLayer));
}
