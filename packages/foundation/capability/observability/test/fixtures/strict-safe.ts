import { AttributeKeyName, InstrumentCatalog, ObservabilityInstruments } from "@beep/observability/catalog";
import {
  durationBucketOf,
  layerDevMemoryStrictSpoolKey,
  layerInMemoryEgressSink,
  layerStrictOtlp,
  layerStrictSaltFromKey,
  layerStrictSpool,
  layerStrictSpoolSink,
  resolveStrictTier,
  StrictGateConfig,
  StrictSalt,
  StrictSpoolOptions,
} from "@beep/observability/strict";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const config = StrictGateConfig.make({
  serviceName: "strict-safe",
  serviceVersion: "0.0.0",
  keyEpoch: "1",
  toolIds: ["lookup"],
  toolSpanPrefixes: ["mcp.tool.call."],
  toolKey: AttributeKeyName.make("beep.strict_safe.tool"),
  catalog: InstrumentCatalog.make({
    attributes: ObservabilityInstruments.attributes,
    instruments: ObservabilityInstruments.instruments,
  }),
});

const salt = Layer.succeed(StrictSalt, StrictSalt.of({ keyedHex: (_nonce, value) => value }));

void layerStrictOtlp(config).pipe(Layer.provide(Layer.mergeAll(salt, layerInMemoryEgressSink())));
void durationBucketOf(12);

const tier = resolveStrictTier(O.none(), []).tier;
void layerStrictOtlp(config).pipe(
  Layer.provide(layerStrictSpoolSink),
  Layer.provide(layerStrictSpool(StrictSpoolOptions.make({ directory: "/spool", tier }))),
  Layer.provide(layerStrictSaltFromKey((_key, value) => value)),
  Layer.provide(layerDevMemoryStrictSpoolKey)
);
