import * as A from "effect/Array";
import { constant, constFalse, constNull, constTrue, constUndefined, constVoid, flow } from "effect/Function";
import * as R from "effect/Record";
import * as Str from "effect/String";

export const thunkEmtpyRecord = flow(R.empty);
export const thunkEmptyArray = flow(A.empty);
export const thunkEmptyStr = constant(Str.empty);
export const thunkZero = constant(0);
export const thunkTrue = constTrue;
export const thunkFalse = constFalse;
export const thunkNull = constNull;
export const thunkUndefined = constUndefined;
// noOp;
export const thunkVoid = constVoid;
export const thunk = flow(constant);
