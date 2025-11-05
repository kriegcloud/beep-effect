import { variance } from "@beep/schema/variance";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as GlobalValue from "effect/GlobalValue";
import * as ParseResult from "effect/ParseResult";
import * as Pipeable from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type * as Types from "effect/Types";

type MissingSelfGeneric<
  Usage extends string,
  Params extends string = "",
> = `Missing \`Self\` generic - use \`class Self extends ${Usage}<Self>()(${Params}{ ... })\``;

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type ClassAnnotations<Self, A> =
  | S.Annotations.Schema<Self>
  | readonly [
      // Annotations for the "to" schema
      S.Annotations.Schema<Self> | undefined,
      // Annotations for the "transformation schema
      (S.Annotations.Schema<Self> | undefined)?,
      // Annotations for the "from" schema
      S.Annotations.Schema<A>?,
    ];

/**
 * @category api interface
 * @since 3.10.0
 */
export interface Class<Self, Fields extends S.Struct.Fields, I, R, C, Inherited, Proto>
  extends S.Schema<Self, Types.Simplify<I>, R> {
  new (
    props: RequiredKeys<C> extends never ? void | Types.Simplify<C> : Types.Simplify<C>,
    options?: S.MakeOptions
  ): S.Struct.Type<Fields> & Inherited & Proto;

  /** @since 3.10.0 */
  readonly ast: AST.Transformation;

  make<C extends new (...args: UnsafeTypes.UnsafeArray) => UnsafeTypes.UnsafeAny>(
    this: C,
    ...args: ConstructorParameters<C>
  ): InstanceType<C>;

  annotations(annotations: S.Annotations.Schema<Self>): S.SchemaClass<Self, Types.Simplify<I>, R>;

  readonly fields: { readonly [K in keyof Fields]: Fields[K] };

  readonly identifier: string;

  /**
   * @example
   * ```ts
   * import { Schema } from "effect"
   *
   * class MyClass extends Schema.Class<MyClass>("MyClass")({
   *  myField: Schema.String
   * }) {
   *  myMethod() {
   *    return this.myField + "my"
   *  }
   * }
   *
   * class NextClass extends MyClass.extend<NextClass>("NextClass")({
   *  nextField: Schema.Number
   * }) {
   *  nextMethod() {
   *    return this.myMethod() + this.myField + this.nextField
   *  }
   * }
   * ```
   */
  extend<Extended = never>(
    identifier: string
  ): <NewFields extends S.Struct.Fields>(
    fields: NewFields | HasFields<NewFields>,
    annotations?: ClassAnnotations<Extended, Types.Simplify<S.Struct.Type<Fields & NewFields>>>
  ) => [Extended] extends [never]
    ? MissingSelfGeneric<"Base.extend">
    : Class<
        Extended,
        Fields & NewFields,
        I & S.Struct.Encoded<NewFields>,
        R | S.Struct.Context<NewFields>,
        C & S.Struct.Constructor<NewFields>,
        Self,
        Proto
      >;

  /**
   * @example
   * ```ts
   * import { Effect, Schema } from "effect"
   *
   * class MyClass extends Schema.Class<MyClass>("MyClass")({
   *   myField: Schema.String
   * }) {
   *   myMethod() {
   *     return this.myField + "my"
   *   }
   * }
   *
   * class NextClass extends MyClass.transformOrFail<NextClass>("NextClass")({
   *   nextField: Schema.Number
   * }, {
   *   decode: (i) =>
   *     Effect.succeed({
   *       myField: i.myField,
   *       nextField: i.myField.length
   *     }),
   *   encode: (a) => Effect.succeed({ myField: a.myField })
   * }) {
   *   nextMethod() {
   *     return this.myMethod() + this.myField + this.nextField
   *   }
   * }
   * ```
   */
  transformOrFail<Transformed = never>(
    identifier: string
  ): <NewFields extends S.Struct.Fields, R2, R3>(
    fields: NewFields,
    options: {
      readonly decode: (
        input: Types.Simplify<S.Struct.Type<Fields>>,
        options: AST.ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<Types.Simplify<S.Struct.Type<Fields & NewFields>>, ParseResult.ParseIssue, R2>;
      readonly encode: (
        input: Types.Simplify<S.Struct.Type<Fields & NewFields>>,
        options: AST.ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<S.Struct.Type<Fields>, ParseResult.ParseIssue, R3>;
    },
    annotations?: ClassAnnotations<Transformed, Types.Simplify<S.Struct.Type<Fields & NewFields>>>
  ) => [Transformed] extends [never]
    ? MissingSelfGeneric<"Base.transformOrFail">
    : Class<
        Transformed,
        Fields & NewFields,
        I,
        R | S.Struct.Context<NewFields> | R2 | R3,
        C & S.Struct.Constructor<NewFields>,
        Self,
        Proto
      >;

  /**
   * @example
   * ```ts
   * import { Effect, Schema } from "effect"
   *
   * class MyClass extends Schema.Class<MyClass>("MyClass")({
   *   myField: Schema.String
   * }) {
   *   myMethod() {
   *     return this.myField + "my"
   *   }
   * }
   *
   * class NextClass extends MyClass.transformOrFailFrom<NextClass>("NextClass")({
   *   nextField: Schema.Number
   * }, {
   *   decode: (i) =>
   *     Effect.succeed({
   *       myField: i.myField,
   *       nextField: i.myField.length
   *     }),
   *   encode: (a) => Effect.succeed({ myField: a.myField })
   * }) {
   *   nextMethod() {
   *     return this.myMethod() + this.myField + this.nextField
   *   }
   * }
   * ```
   */
  transformOrFailFrom<Transformed = never>(
    identifier: string
  ): <NewFields extends S.Struct.Fields, R2, R3>(
    fields: NewFields,
    options: {
      readonly decode: (
        input: Types.Simplify<I>,
        options: AST.ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<Types.Simplify<I & S.Struct.Encoded<NewFields>>, ParseResult.ParseIssue, R2>;
      readonly encode: (
        input: Types.Simplify<I & S.Struct.Encoded<NewFields>>,
        options: AST.ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<I, ParseResult.ParseIssue, R3>;
    },
    annotations?: ClassAnnotations<Transformed, Types.Simplify<S.Struct.Type<Fields & NewFields>>>
  ) => [Transformed] extends [never]
    ? MissingSelfGeneric<"Base.transformOrFailFrom">
    : Class<
        Transformed,
        Fields & NewFields,
        I,
        R | S.Struct.Context<NewFields> | R2 | R3,
        C & S.Struct.Constructor<NewFields>,
        Self,
        Proto
      >;
}

type HasFields<Fields extends S.Struct.Fields> =
  | S.Struct<Fields>
  | {
      readonly [S.RefineSchemaId]: HasFields<Fields>;
    };

const isField = (u: unknown) => S.isSchema(u) || S.isPropertySignature(u);

const isFields = <Fields extends S.Struct.Fields>(fields: object): fields is Fields =>
  Reflect.ownKeys(fields).every((key) => isField((fields as UnsafeTypes.UnsafeAny)[key]));

const getFields = <Fields extends S.Struct.Fields>(hasFields: HasFields<Fields>): Fields =>
  "fields" in hasFields ? hasFields.fields : getFields(hasFields[S.RefineSchemaId]);

const getSchemaFromFieldsOr = <Fields extends S.Struct.Fields>(fieldsOr: Fields | HasFields<Fields>): S.Schema.Any =>
  isFields(fieldsOr) ? S.Struct(fieldsOr) : S.isSchema(fieldsOr) ? fieldsOr : S.Struct(getFields(fieldsOr));

const getFieldsFromFieldsOr = <Fields extends S.Struct.Fields>(fieldsOr: Fields | HasFields<Fields>): Fields =>
  isFields(fieldsOr) ? fieldsOr : getFields(fieldsOr);

/**
 * @example
 * ```ts
 * import { Schema } from "effect"
 *
 * class MyClass extends Schema.Class<MyClass>("MyClass")({
 *  someField: Schema.String
 * }) {
 *  someMethod() {
 *    return this.someField + "bar"
 *  }
 * }
 * ```
 *
 * @category classes
 * @since 3.10.0
 */
export const Class =
  <Self = never>(identifier: string) =>
  <Fields extends S.Struct.Fields>(
    fieldsOr: Fields | HasFields<Fields>,
    annotations?: ClassAnnotations<Self, Types.Simplify<S.Struct.Type<Fields>>>
  ): [Self] extends [never]
    ? MissingSelfGeneric<"Class">
    : Class<Self, Fields, S.Struct.Encoded<Fields>, S.Struct.Context<Fields>, S.Struct.Constructor<Fields>, {}, {}> =>
    makeClass({
      kind: "Class",
      identifier,
      schema: getSchemaFromFieldsOr(fieldsOr),
      fields: getFieldsFromFieldsOr(fieldsOr),
      Base: Data.Class,
      annotations: {
        ...annotations,
        identifier: identifier,
      },
    });

export function formatPropertyKey(name: PropertyKey): string {
  return P.isString(name) ? JSON.stringify(name) : String(name);
}

export const isNonEmpty = <A>(x: ParseResult.SingleOrNonEmpty<A>): x is A.NonEmptyReadonlyArray<A> => Array.isArray(x);
/** @internal */
export const formatPathKey = (key: PropertyKey): string => `[${formatPropertyKey(key)}]`;

/** @internal */
export const formatPath = (path: ParseResult.Path): string =>
  isNonEmpty(path) ? path.map(formatPathKey).join("") : formatPathKey(path);
const getErrorMessage = (
  reason: string,
  details?: string,
  path?: ReadonlyArray<PropertyKey>,
  ast?: AST.AST
): string => {
  let out = reason;

  if (path && A.isNonEmptyReadonlyArray(path)) {
    out += `\nat path: ${formatPath(path)}`;
  }

  if (details !== undefined) {
    out += `\ndetails: ${details}`;
  }

  if (ast) {
    out += `\nschema (${ast._tag}): ${ast}`;
  }

  return out;
};
export const getASTDuplicateIndexSignatureErrorMessage = (type: "string" | "symbol"): string =>
  getErrorMessage("Duplicate index signature", `${type} index signature`);
/** @internal */
export const getClassTag = <Tag extends string>(tag: Tag) =>
  S.withConstructorDefault(S.propertySignature(S.Literal(tag)), () => tag);

/**
 * @category api interface
 * @since 3.10.0
 */
export interface TaggedClass<Self, Tag extends string, Fields extends S.Struct.Fields>
  extends Class<
    Self,
    Fields,
    S.Struct.Encoded<Fields>,
    S.Struct.Context<Fields>,
    S.Struct.Constructor<Omit<Fields, "_tag">>,
    {},
    {}
  > {
  readonly _tag: Tag;
}

const CIRCULAR = "[Circular]";
export const formatDate = (date: Date): string => {
  try {
    return date.toISOString();
  } catch {
    return String(date);
  }
};

export function formatUnknown(input: unknown, whitespace: number | string | undefined = 0): string {
  const seen = new WeakSet<object>();
  const gap = !whitespace ? "" : typeof whitespace === "number" ? " ".repeat(whitespace) : whitespace;
  const ind = (d: number) => gap.repeat(d);

  const safeToString = (x: UnsafeTypes.UnsafeAny): string => {
    try {
      const s = x.toString();
      return typeof s === "string" ? s : String(s);
    } catch {
      return "[toString threw]";
    }
  };

  const wrap = (v: unknown, body: string): string => {
    const ctor = (v as UnsafeTypes.UnsafeAny)?.constructor;
    return ctor && ctor !== Object.prototype.constructor && ctor.name ? `${ctor.name}(${body})` : body;
  };

  const ownKeys = (o: object): Array<PropertyKey> => {
    try {
      return Reflect.ownKeys(o);
    } catch {
      return ["[ownKeys threw]"];
    }
  };

  function go(v: unknown, d = 0): string {
    if (Array.isArray(v)) {
      if (seen.has(v)) return CIRCULAR;
      seen.add(v);
      if (!gap || v.length <= 1) return `[${v.map((x) => go(x, d)).join(",")}]`;
      const inner = v.map((x) => go(x, d + 1)).join(`,\n${ind(d + 1)}`);
      return `[\n${ind(d + 1)}${inner}\n${ind(d)}]`;
    }

    if (P.isDate(v)) return formatDate(v);

    if (
      P.hasProperty(v, "toString") &&
      P.isFunction((v as UnsafeTypes.UnsafeAny)["toString" as const]) &&
      (v as UnsafeTypes.UnsafeAny)["toString" as const] !== Object.prototype.toString
    )
      return safeToString(v);

    if (P.isString(v)) return JSON.stringify(v);

    if (P.isNumber(v) || v == null || P.isBoolean(v) || P.isSymbol(v)) return String(v);

    if (P.isBigInt(v)) return `${String(v)}n`;

    if (v instanceof Set || v instanceof Map) {
      if (seen.has(v)) return CIRCULAR;
      seen.add(v);
      return `${v.constructor.name}(${go(Array.from(v), d)})`;
    }

    if (P.isObject(v)) {
      if (seen.has(v)) return CIRCULAR;
      seen.add(v);
      const keys = ownKeys(v);
      if (!gap || keys.length <= 1) {
        const body = `{${keys.map((k) => `${formatPropertyKey(k)}:${go((v as UnsafeTypes.UnsafeAny)[k], d)}`).join(",")}}`;
        return wrap(v, body);
      }
      const body = `{\n${keys
        .map((k) => `${ind(d + 1)}${formatPropertyKey(k)}: ${go((v as UnsafeTypes.UnsafeAny)[k], d + 1)}`)
        .join(",\n")}\n${ind(d)}}`;
      return wrap(v, body);
    }

    return String(v);
  }

  return go(input, 0);
}

const extendFields = (a: S.Struct.Fields, b: S.Struct.Fields): S.Struct.Fields => {
  const out = { ...a };
  for (const key of Reflect.ownKeys(b)) {
    if (key in a) {
      throw new Error(getErrorMessage("Duplicate property signature", `Duplicate key ${formatUnknown(key)}`));
    }
    out[key] = b[key]!;
  }
  return out;
};
/**
 * @example
 * ```ts
 * import { Schema } from "effect"
 *
 * class MyClass extends Schema.TaggedClass<MyClass>("MyClass")("MyClass", {
 *  a: Schema.String
 * }) {}
 * ```
 *
 * @category classes
 * @since 3.10.0
 */
export const TaggedClass =
  <Self = never>(identifier?: string) =>
  <Tag extends string, Fields extends S.Struct.Fields>(
    tag: Tag,
    fieldsOr: Fields | HasFields<Fields>,
    annotations?: ClassAnnotations<Self, Types.Simplify<S.Struct.Type<{ readonly _tag: S.tag<Tag> } & Fields>>>
  ): [Self] extends [never]
    ? MissingSelfGeneric<"TaggedClass", `"Tag", `>
    : TaggedClass<Self, Tag, { readonly _tag: S.tag<Tag> } & Fields> => {
    const fields = getFieldsFromFieldsOr(fieldsOr);
    const schema = getSchemaFromFieldsOr(fieldsOr);
    const newFields = { _tag: getClassTag(tag) };
    const taggedFields = extendFields(newFields, fields);
    return class TaggedClass extends makeClass({
      kind: "TaggedClass",
      identifier: identifier ?? tag,
      schema: S.extend(schema, S.Struct(newFields)),
      fields: taggedFields,
      Base: Data.Class,
      annotations: {
        identifier: identifier,
        ...annotations,
      },
    }) {
      static _tag = tag;
    } as UnsafeTypes.UnsafeAny;
  };
const getClassAnnotations = <Self, A>(
  annotations: ClassAnnotations<Self, A> | undefined
): [S.Annotations.Schema<Self>?, S.Annotations.Schema<Self>?, S.Annotations.Schema<A>?] => {
  if (annotations === undefined) {
    return [];
  }
  if (Array.isArray(annotations)) {
    return annotations as UnsafeTypes.UnsafeAny;
  }
  return [annotations] as UnsafeTypes.UnsafeAny;
};
/** @internal */
export const AutoTitleAnnotationId: unique symbol = Symbol.for("@beep/schema/custom/annotation/AutoTitle");
const lazilyMergeDefaults = (
  fields: S.Struct.Fields,
  out: Record<PropertyKey, unknown>
): { [x: string | symbol]: unknown } => {
  const ownKeys = Reflect.ownKeys(fields);
  for (const key of ownKeys) {
    const field = fields[key];
    if (out[key] === undefined && S.isPropertySignature(field)) {
      const ast = field.ast;
      const defaultValue = ast._tag === "PropertySignatureDeclaration" ? ast.defaultValue : ast.to.defaultValue;
      if (defaultValue !== undefined) {
        out[key] = defaultValue();
      }
    }
  }
  return out;
};

function getDisableValidationMakeOption(options: S.MakeOptions | undefined): boolean {
  return P.isBoolean(options) ? options : (options?.disableValidation ?? false);
}

const astCache = GlobalValue.globalValue("effect/Schema/astCache", () => new WeakMap<UnsafeTypes.UnsafeAny, AST.AST>());

const makeClass = <Fields extends S.Struct.Fields>({
  Base,
  annotations,
  disableToString,
  fields,
  identifier,
  kind,
  schema,
}: {
  kind: "Class" | "TaggedClass" | "TaggedError" | "TaggedRequest";
  identifier: string;
  schema: S.Schema.Any;
  fields: Fields;
  Base: new (...args: ReadonlyArray<UnsafeTypes.UnsafeAny>) => UnsafeTypes.UnsafeAny;
  annotations?: ClassAnnotations<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> | undefined;
  disableToString?: boolean | undefined;
}): UnsafeTypes.UnsafeAny => {
  const classSymbol = Symbol.for(`@beep/schema/${kind}/${identifier}`);

  const [typeAnnotations, transformationAnnotations, encodedAnnotations] = getClassAnnotations({
    ...annotations,
    identifier: identifier,
  });

  const typeSchema_ = S.typeSchema(schema);

  const declarationSurrogate = typeSchema_.annotations({
    ...typeAnnotations,
    identifier,
  });

  const typeSide = typeSchema_.annotations({
    [AutoTitleAnnotationId]: `${identifier} (Type side)`,
    ...typeAnnotations,
    identifier,
  });

  const constructorSchema = schema.annotations({
    [AutoTitleAnnotationId]: `${identifier} (Constructor)`,
    ...typeAnnotations,
    identifier,
  });

  const encodedSide = schema.annotations({
    [AutoTitleAnnotationId]: `${identifier} (Encoded side)`,
    ...encodedAnnotations,
    identifier,
  });

  const transformationSurrogate = schema.annotations({
    ...encodedAnnotations,
    ...typeAnnotations,
    ...transformationAnnotations,
    identifier,
  });

  const fallbackInstanceOf = (u: unknown) => P.hasProperty(u, classSymbol) && ParseResult.is(typeSide)(u);

  const klass = class extends Base {
    constructor(props: { [x: string | symbol]: unknown } = {}, options: S.MakeOptions = false) {
      props = { ...props };
      if (kind !== "Class") {
        delete props["_tag" as const];
      }
      props = lazilyMergeDefaults(fields, props);
      if (!getDisableValidationMakeOption(options)) {
        props = ParseResult.validateSync(constructorSchema)(props);
      }
      super(props, true);
    }

    // ----------------
    // Schema interface
    // ----------------

    static [S.TypeId] = variance;

    static get ast(): AST.AST {
      let out = astCache.get(this);
      if (out) {
        return out;
      }

      const declaration: S.Schema.Any = S.declare(
        [schema],
        {
          decode: () => (input, _, ast) =>
            input instanceof this || fallbackInstanceOf(input)
              ? ParseResult.succeed(input)
              : ParseResult.fail(new ParseResult.Type(ast, input)),
          encode: () => (input, options) =>
            input instanceof this
              ? ParseResult.succeed(input)
              : ParseResult.map(ParseResult.encodeUnknown(typeSide)(input, options), (props) => new this(props, true)),
        },
        {
          identifier,
          pretty: (pretty) => (self: UnsafeTypes.UnsafeAny) => `${identifier}(${pretty(self)})`,
          // @ts-expect-error
          arbitrary: (arb) => (fc) => arb(fc).map((props) => new this(props)),
          equivalence: F.identity,
          [AST.SurrogateAnnotationId]: declarationSurrogate.ast,
          ...typeAnnotations,
        }
      );

      out = S.transform(encodedSide, declaration, {
        strict: true,
        decode: (i) => new this(i, true),
        encode: F.identity,
      }).annotations({
        [AST.SurrogateAnnotationId]: transformationSurrogate.ast,
        ...transformationAnnotations,
        ...encodedAnnotations,
        ...typeAnnotations,
        identifier,
      }).ast;

      astCache.set(this, out);

      return out;
    }

    static pipe() {
      return Pipeable.pipeArguments(this, arguments);
    }

    static annotations(annotations: S.Annotations.Schema<UnsafeTypes.UnsafeAny>) {
      return S.make(this.ast).annotations({
        ...annotations,
        identifier,
      });
    }

    static override toString() {
      return `(${String(encodedSide)} <-> ${identifier})`;
    }

    // ----------------
    // Class interface
    // ----------------

    static make(...args: Array<UnsafeTypes.UnsafeAny>) {
      return new this(...args);
    }

    static fields = { ...fields };

    static identifier = identifier;

    static extend<Extended, NewFields extends S.Struct.Fields>(identifier: string) {
      return (
        newFieldsOr: NewFields | HasFields<NewFields>,
        annotations?: ClassAnnotations<Extended, Types.Simplify<S.Struct.Type<Fields & NewFields>>>
      ) => {
        const newFields = getFieldsFromFieldsOr(newFieldsOr);
        const newSchema = getSchemaFromFieldsOr(newFieldsOr);
        const extendedFields = extendFields(fields, newFields);
        return makeClass({
          kind,
          identifier,
          schema: S.extend(schema, newSchema),
          fields: extendedFields,
          Base: this,
          annotations: {
            ...annotations,
            identifier: identifier,
          },
        });
      };
    }

    static transformOrFail<Transformed, NewFields extends S.Struct.Fields>(identifier: string) {
      return (
        newFieldsOr: NewFields,
        options: UnsafeTypes.UnsafeAny,
        annotations?: ClassAnnotations<Transformed, Types.Simplify<S.Struct.Type<Fields & NewFields>>>
      ) => {
        const transformedFields: S.Struct.Fields = extendFields(fields, newFieldsOr);
        return makeClass({
          kind,
          identifier,
          schema: S.transformOrFail(schema, S.typeSchema(S.Struct(transformedFields)), options),
          fields: transformedFields,
          Base: this,
          annotations: {
            ...annotations,
            identifier: identifier,
          },
        });
      };
    }

    static transformOrFailFrom<Transformed, NewFields extends S.Struct.Fields>(identifier: string) {
      return (
        newFields: NewFields,
        options: UnsafeTypes.UnsafeAny,
        annotations?: ClassAnnotations<Transformed, Types.Simplify<S.Struct.Type<Fields & NewFields>>>
      ) => {
        const transformedFields: S.Struct.Fields = extendFields(fields, newFields);
        return makeClass({
          kind,
          identifier,
          schema: S.transformOrFail(S.encodedSchema(schema), S.Struct(transformedFields), options),
          fields: transformedFields,
          Base: this,
          annotations: {
            ...annotations,
            identifier: identifier,
          },
        });
      };
    }

    // ----------------
    // other
    // ----------------

    get [classSymbol]() {
      return classSymbol;
    }
  };
  if (disableToString !== true) {
    Object.defineProperty(klass.prototype, "toString", {
      value() {
        return `${identifier}({ ${Reflect.ownKeys(fields)
          .map((p: UnsafeTypes.UnsafeAny) => `${formatPropertyKey(p)}: ${formatUnknown(this[p])}`)
          .join(", ")} })`;
      },
      configurable: true,
      writable: true,
    });
  }
  return klass;
};
