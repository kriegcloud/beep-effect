/**
 * Metadata injected b y the log transform plugin.
 *
 * Field names are intentionally short to reduce the size of the generated code.
 */
export type CallMetadata = Readonly<{
    /**
     * File name.
     */
    F: string;
    /**
     * Line number.
     */
    L: number;
    /**
     * Value of `this` at the site of the log call.
     * Will be set to the class instance if the call is inside a method, or to the `globalThis` (`window` or `global`) otherwise.
     */
    S: any | undefined;
    /**
     * A callback that will invoke the provided function with provided arguments.
     * Useful in the browser to force a `console.log` call to have a certain stack-trace.
     */
    C?: (fn: Function, args: any[]) => void;
    /**
     * Source code of the argument list.
     */
    A?: undefined | string[];
}>;
export type InvariantFn = (condition: unknown, message?: string, meta?: CallMetadata) => asserts condition;
export declare const invariant: InvariantFn;
declare const InvariantViolation_base: new <A extends Record<string, any> = {}>(args: import("node_modules/effect/dist/dts/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("node_modules/effect/dist/dts/Cause").YieldableError & {
    readonly _tag: "InvariantViolation";
} & Readonly<A>;
export declare class InvariantViolation extends InvariantViolation_base<{
    readonly message: string;
}> {
    constructor(message: string);
}
export {};
//# sourceMappingURL=invariant.d.ts.map