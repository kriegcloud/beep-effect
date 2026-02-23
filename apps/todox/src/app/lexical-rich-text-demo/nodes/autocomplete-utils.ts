// Shared UUID for autocomplete session
// This ensures max one Autocomplete node per session and prevents
// nodes from showing in other collaboration sessions
import * as F from "effect/Function";
import * as Str from "effect/String";

export const uuid = F.pipe(Math.random().toString(36), Str.replace(/[^a-z]+/g, ""), Str.substring(0, 5));
