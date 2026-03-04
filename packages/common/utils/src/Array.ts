import * as A from "effect/Array";

import { flow } from "effect/Function";
import {thunkFalse, thunkTrue} from "./thunk.js";
/**
 * @category pattern matching
 * @since 0.0.0
 */
export const matchToBoolean = flow(A.match({
	onNonEmpty: thunkTrue,
	onEmpty: thunkFalse
}))