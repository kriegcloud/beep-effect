import type { PathObjectFrom } from "@beep/constants/paths/utils";
import { pathObjFromPaths } from "@beep/constants/paths/utils";
import { publicPaths } from "../_generated/asset-paths";

export const assetPaths: PathObjectFrom<typeof publicPaths, true> = pathObjFromPaths(publicPaths, {
  widenLeavesToString: true,
}) as PathObjectFrom<typeof publicPaths, true>;
