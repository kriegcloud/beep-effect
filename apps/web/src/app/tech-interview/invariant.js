import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
export const invariant = (condition, message, meta) => {
    if (condition) {
        return;
    }
    if (Str.isString(message) && Str.startsWith("BUG")(message)) {
        // This invariant is a debug bug-check: break if the debugger is attached.
        debugger;
    }
    let errorMessage = "invariant violation";
    if (message) {
        errorMessage += `: ${message}`;
    }
    if (meta?.A) {
        errorMessage += ` [${meta.A[0]}]`;
    }
    if (meta?.F) {
        errorMessage += ` at ${getRelativeFilename(meta.F)}:${meta.L}`;
    }
    const error = new InvariantViolation(errorMessage);
    // Do not include the invariant function in the stack trace.
    Error.captureStackTrace(error, invariant);
    throw error;
};
export class InvariantViolation extends Data.TaggedError("InvariantViolation") {
    constructor(message) {
        super({
            message,
        });
        // NOTE: Restores prototype chain (https://stackoverflow.com/a/48342359).
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
const getRelativeFilename = (filename) => F.pipe(filename, Str.match(/.+\/(packages\/.+\/.+)/), O.match({
    onNone: () => filename,
    onSome: (match) => F.pipe(match[1], O.fromNullable, O.getOrElse(() => filename))
}));
//# sourceMappingURL=invariant.js.map