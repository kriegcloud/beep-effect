import { $UiId } from "@beep/identity";
import { FilePath, LiteralKit, NonNegativeInt, Sha256Hex } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $UiId.create("components/codegraph/neo4j");

export class DeadCodeItem extends S.Class<DeadCodeItem>($I`DeadCodeItem`)(
  {
    name: S.String,
    filePath: FilePath,
  },
  $I.annote("DeadCodeItem", {
    description: "A dead code item",
  })
) {}

export class GodObjectItem extends S.Class<GodObjectItem>($I`GodObjectItem`)(
  {
    name: S.String,
    filePath: FilePath,
    depCount: NonNegativeInt,
  },
  $I.annote("GodObjectItem", {
    description: "A god object item",
  })
) {}

export class GodFileItem extends S.Class<GodFileItem>($I`GodFileItem`)(
  {
    filePath: FilePath,
    functionCount: NonNegativeInt,
    totalLines: NonNegativeInt,
  },
  $I.annote("GodFileItem", {})
) {}

export class DuplicateGroupFunction extends S.Class<DuplicateGroupFunction>($I`DuplicateGroupFunction`)({
  name: S.String,
  filePath: FilePath,
}) {}

export class DuplicateGroup extends S.Class<DuplicateGroup>($I`DuplicateGroup`)({
  bodyHash: Sha256Hex,
  count: NonNegativeInt,
  functions: S.Array(DuplicateGroupFunction),
}) {}

export class HealthStats extends S.Class<HealthStats>($I`HealthStats`)({
  nodeCount: NonNegativeInt,
  edgeCount: NonNegativeInt,
  fileCount: NonNegativeInt,
  functionCount: NonNegativeInt,
  classCount: NonNegativeInt,
  routeCount: NonNegativeInt,
  variableCount: NonNegativeInt,
  eventCount: NonNegativeInt,
  envVarCount: NonNegativeInt,
  moduleCount: NonNegativeInt,
  dbTableCount: NonNegativeInt,
  externalApiCount: NonNegativeInt,
  securityIssueCount: NonNegativeInt,
  deadCodeCount: NonNegativeInt,
  godObjectCount: NonNegativeInt,
  godFileCount: NonNegativeInt,
  duplicateCount: NonNegativeInt,
  deadCodeItems: S.Array(DeadCodeItem),
  godObjectItems: S.Array(GodObjectItem),
  godFileItems: S.Array(GodFileItem),
  duplicateGroups: S.Array(DuplicateGroup),
}) {}

export const ViewMode = LiteralKit(["overview", "full"]).pipe(
  $I.annoteSchema("ViewMode", {
    description: "The view mode for the codegraph",
  })
);

export type ViewMode = typeof ViewMode.Type;

export const CacheKey = S.TemplateLiteral([S.String, ":", S.Union([S.String, S.Literal("all")])]).pipe(
  $I.annoteSchema("CacheKey", {
    description: "The cache key for the codegraph",
  })
);

export type CacheKey = typeof CacheKey.Type;
