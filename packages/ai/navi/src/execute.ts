import { RootGroup } from "@beep/logos";
import * as JSONSchema from "effect/JSONSchema";

console.log(JSON.stringify(JSONSchema.make(RootGroup), null, 2));
