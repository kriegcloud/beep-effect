import { BloomFilterLive } from "@beep/knowledge-server/EntityResolution/BloomFilter";
import * as Layer from "effect/Layer";

export const BloomFilterUnitLayer = BloomFilterLive;

export const EntityResolutionUnitLayer = Layer.mergeAll(BloomFilterLive);
