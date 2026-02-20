export interface IDeprecatedFieldExample {
    'one': string;
    /** @deprecated use ONE */
    'deprecatedOne': string;
    /**
     * You should no longer use this
     *
     * @deprecated use ONE
     */
    'documentedDeprecatedOne': string;
    /**
     * You should no longer use this
     *
     * @deprecated should use ONE
     *
     */
    'deprecatedWithinDocumentOne': string;
}
