import * as S from "effect/Schema";
import { $AgentsDomainId } from "@beep/identity";

const $I = $AgentsDomainId.create("Part")

export const ProviderMetadata = S.Record(
	S.String,
	S.NullOr(S.Json)
).pipe(
	$I.annoteSchema("ProviderMetadata", {
		description: "Provider-specific metadata attached to response parts, mapping provider keys to JSON values or null.",
	})
);

export type ProviderMetadata = typeof ProviderMetadata.Type;

export class BasePartDefinition extends S.Class<BasePartDefinition>($I`BasePartDefinition`)(
	{
		type: S.String,
		metadata: S.optionalKey(ProviderMetadata)
	},
	$I.annote("BasePartDefinition", {
		description: "Base part definition"
	})
) {}

