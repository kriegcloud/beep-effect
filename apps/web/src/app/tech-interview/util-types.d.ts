export type NonEmptyString<T extends string = string> = T extends "" ? never : T;
export type KeyFromValue<TValue, TType extends Record<PropertyKey, PropertyKey>> = {
    readonly [K in keyof TType]: TValue extends TType[K] ? K : never;
}[keyof TType];
export type InvertKeyValue<TType extends Record<PropertyKey, PropertyKey>> = {
    readonly [TValue in TType[keyof TType]]: KeyFromValue<TValue, TType>;
};
export type ValueOf<TObj> = TObj[keyof TObj];
//# sourceMappingURL=util-types.d.ts.map