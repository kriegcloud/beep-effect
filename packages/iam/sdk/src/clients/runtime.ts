import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import * as Layer from "effect/Layer";

export const iamAtomRuntime = makeAtomRuntime(Layer.empty);
