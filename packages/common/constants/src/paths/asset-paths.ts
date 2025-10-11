import { type PathObjectFrom, pathObjFromPaths } from "@beep/constants/paths/utils";
import { publicPaths } from "../_generated";

export const assetPaths: PathObjectFrom<typeof publicPaths, true> = pathObjFromPaths(publicPaths, {
  widenLeavesToString: true,
}) as PathObjectFrom<typeof publicPaths, true>;
