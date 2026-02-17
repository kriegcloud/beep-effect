import {identity} from "effect/Function";
import * as O from "effect/Option";

export const resolveStringOrUnknown = (option: O.Option<string>): string =>
    O.match(option, {
        onNone: () => "unknown",
        onSome: identity,
    })
