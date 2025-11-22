import { $SchemaId } from "@beep/identity/packages";

export const { $BuildersId, $CoreId, $DerivedId, $IdentityId, $IntegrationsId, $InternalId, $PrimitivesId } =
  $SchemaId.compose("builders", "core", "derived", "identity", "integrations", "internal", "primitives");
