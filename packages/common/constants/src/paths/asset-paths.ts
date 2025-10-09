import { publicPaths } from "./generated/index.js";
import type { PathObjectFrom } from "./utils/public-paths-to-record.js";
import { pathObjFromPaths } from "./utils/public-paths-to-record.js";

export const assetPaths: PathObjectFrom<typeof publicPaths, true> = pathObjFromPaths(publicPaths, {
  widenLeavesToString: true,
}) as PathObjectFrom<typeof publicPaths, true>;
