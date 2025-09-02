export type LiteralString = "" | (string & Record<never, never>);
export type FieldType = "string" | "number" | "boolean" | "date" | `${"string" | "number"}[]` | Array<LiteralString>;

export type Primitive = string | number | boolean | Date | null | undefined | string[] | number[];

export type FieldAttributeConfig<T extends FieldType = FieldType> = {
  readonly required?: undefined | boolean;
  readonly returned?: undefined | boolean;
  readonly input?: undefined | boolean;
  readonly defaultValue?: undefined | Primitive | (() => Primitive);
  readonly transform?:
    | undefined
    | {
        readonly input?: undefined | ((value: Primitive) => Primitive | Promise<Primitive>);
        readonly output?: undefined | ((value: Primitive) => Primitive | Promise<Primitive>);
      };
  /**
   * Reference to another model.
   */
  readonly references?: {
    /**
     * The model to reference.
     */
    readonly model: string;
    /**
     * The field on the referenced model.
     */
    readonly field: string;
    /**
     * The action to perform when the reference is deleted.
     * @default "cascade"
     */
    readonly onDelete?: undefined | ("no action" | "restrict" | "cascade" | "set null" | "set default");
  };
  readonly unique?: undefined | boolean;
  /**
   * If the field should be a bigint on the database instead of integer.
   */
  readonly bigint?: undefined | boolean;
  /**
   * Why is zod always every where?!!! A zod schema to validate the value.
   */
  // validator?: {
  //     input?: ZodSchema;
  //     output?: ZodSchema;
  // };
  /**
   * The name of the field on the database.
   */
  readonly fieldName?: undefined | string;
  /**
   * If the field should be sortable.
   *
   * applicable only for `text` type.
   * It's useful to mark fields varchar instead of text.
   */
  readonly sortable?: undefined | boolean;
};

export type FieldAttribute<T extends FieldType = FieldType> = {
  type: T;
} & FieldAttributeConfig<T>;
