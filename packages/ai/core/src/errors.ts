import * as Data from "effect/Data";

export class NetworkError extends Data.TaggedError("NetworkError") {}

export class ProviderOutage extends Data.TaggedError("ProviderOutage") {}
