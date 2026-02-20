export interface IDeprecatedFieldExample {
    readonly 'one': string;
    /** @deprecated use ONE */
    readonly 'deprecatedOne': string;
    /**
     * You should no longer use this
     *
     * @deprecated use ONE
     */
    readonly 'documentedDeprecatedOne': string;
    /**
     * You should no longer use this
     *
     * @deprecated should use ONE
     *
     */
    readonly 'deprecatedWithinDocumentOne': string;
}
