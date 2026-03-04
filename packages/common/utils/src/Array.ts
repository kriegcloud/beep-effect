import { flow } from "effect";
import * as A from "effect/Array";
import { thunkFalse, thunkTrue } from "./thunk.js";
/**
 * @category pattern matching
 * @since 0.0.0
 */
export const matchToBoolean = flow(
  A.match({
    onNonEmpty: thunkTrue,
    onEmpty: thunkFalse,
  })
);
