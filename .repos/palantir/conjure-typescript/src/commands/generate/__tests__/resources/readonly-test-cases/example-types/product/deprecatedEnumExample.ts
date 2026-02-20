export namespace DeprecatedEnumExample {
    export type ONE = "ONE";
    /** @deprecated use ONE */
    export type OLD_ONE = "OLD_ONE";
    /**
     * You should no longer use this
     *
     * @deprecated use ONE
     */
    export type OLD_DEPRECATED_ONE = "OLD_DEPRECATED_ONE";
    /**
     * You should no longer use this
     *
     * @deprecated should use ONE
     *
     */
    export type OLD_DOCUMENTED_ONE = "OLD_DOCUMENTED_ONE";

    export const ONE = "ONE" as "ONE";
    export const OLD_ONE = "OLD_ONE" as "OLD_ONE";
    export const OLD_DEPRECATED_ONE = "OLD_DEPRECATED_ONE" as "OLD_DEPRECATED_ONE";
    export const OLD_DOCUMENTED_ONE = "OLD_DOCUMENTED_ONE" as "OLD_DOCUMENTED_ONE";
}

export type DeprecatedEnumExample = keyof typeof DeprecatedEnumExample;
