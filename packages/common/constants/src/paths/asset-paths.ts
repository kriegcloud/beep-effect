import { publicPaths } from "@beep/constants/_generated";
import { type PathObjectFrom, pathObjFromPaths } from "@beep/constants/paths/utils";

export const assetPaths: PathObjectFrom<typeof publicPaths, true> = pathObjFromPaths(publicPaths, {
  widenLeavesToString: true,
}) as PathObjectFrom<typeof publicPaths, true>;
