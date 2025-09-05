import { BS } from "@beep/schema";
import type { StringTypes, StructTypes } from "@beep/types";
import * as Data from "effect/Data";
import * as S from "effect/Schema";
import * as Str from "effect/String";

type OperatorConfigBase = {
  readonly identifier: StringTypes.NonEmptyString<string>;
  readonly title: StringTypes.NonEmptyString<string>;
  readonly schemaId: symbol;
  readonly fields: StructTypes.StructFieldsWithStringKeys;
  readonly description: StringTypes.NonEmptyString<string>;
};

type OperatorConfig<
  TCategoryConfig extends CategoryConfigBase,
  TKindConfig extends KindConfigBase,
  TDomainConfig extends DomainConfigBase,
  TOperatorConfig extends OperatorConfigBase,
> = {
  readonly category: CategoryFactory<TCategoryConfig>;
  readonly kind: KindFactory<TCategoryConfig, TKindConfig>;
  readonly domain: DomainFactory<TCategoryConfig, TKindConfig, TDomainConfig>;
  readonly operator: {
    readonly [K in keyof TOperatorConfig]: TOperatorConfig[K];
  };
};

export class OperatorDef<
  const TCategoryConfig extends CategoryConfigBase,
  const TKindConfig extends KindConfigBase,
  const TDomainConfig extends DomainConfigBase,
  const TOperatorConfig extends OperatorConfigBase,
> extends Data.TaggedClass("OperatorDef")<
  OperatorConfig<TCategoryConfig, TKindConfig, TDomainConfig, TOperatorConfig>
> {
  readonly Schema: S.Struct<
    {
      category: S.PropertySignature<
        ":",
        Exclude<TCategoryConfig["category"], undefined>,
        never,
        "?:",
        TCategoryConfig["category"] | undefined,
        true,
        never
      >;
      operator: S.PropertySignature<
        ":",
        Exclude<TKindConfig["operator"], undefined>,
        never,
        "?:",
        TKindConfig["operator"] | undefined,
        true,
        never
      >;
      type: S.PropertySignature<
        ":",
        Exclude<TDomainConfig["type"], undefined>,
        never,
        "?:",
        TDomainConfig["type"] | undefined,
        true,
        never
      >;
    } & TCategoryConfig["fields"] &
      TKindConfig["fields"] &
      TDomainConfig["fields"] &
      TOperatorConfig["fields"]
  >;

  constructor(readonly params: OperatorConfig<TCategoryConfig, TKindConfig, TDomainConfig, TOperatorConfig>) {
    super(params);

    const makeAnnotations = (tag: string) => {
      const split = Str.split("_")(tag).map(Str.capitalize);
      const identifier = split.join("");
      const title = split.join(" ");
      const schemaId = Symbol.for(`@beep/rules/operators/${tag}/${identifier}`);
      return {
        schemaId,
        identifier,
        title,
      };
    };

    // BS.Struct is the same as `Schema.Struct` just my personal one with `batching` enabled by default
    this.Schema = BS.Struct({
      category: BS.LiteralWithDefault(params.category.config.category, {
        ...makeAnnotations(params.category.category),
        description: params.category.categoryDescription,
      }),
      operator: BS.LiteralWithDefault(params.kind.operator, {
        ...makeAnnotations(params.kind.operator),
        description: params.kind.description,
      }),
      type: BS.LiteralWithDefault(params.domain.domain.type, {
        ...makeAnnotations(params.domain.domain.type),
        description: params.domain.description,
      }),
      ...this.operator.fields,
      ...this.domain.domain.fields,
      ...this.kind.kindConfig.fields,
      ...this.category.config.fields,
    }).annotations({
      schemaId: params.operator.schemaId,
      identifier: params.operator.identifier,
      title: params.operator.title,
      description: params.operator.description,
      [BS.SymbolAnnotationId]: params.kind.symbol,
    });
  }
}

type DomainConfigBase = {
  readonly type: StringTypes.NonEmptyString<string>;
  readonly description: StringTypes.NonEmptyString<string>;
  readonly fields: StructTypes.StructFieldsWithStringKeys;
};

type DomainConfig<
  TCategoryConfig extends CategoryConfigBase,
  TKindConfig extends KindConfigBase,
  TDomainConfig extends DomainConfigBase,
> = {
  readonly category: CategoryFactory<TCategoryConfig>;
  readonly kind: KindFactory<TCategoryConfig, TKindConfig>;
  readonly domain: {
    readonly [K in keyof TDomainConfig]: TDomainConfig[K];
  };
};

export class DomainFactory<
  const TCategoryConfig extends CategoryConfigBase,
  const TKindConfig extends KindConfigBase,
  const TDomainConfig extends DomainConfigBase,
> extends Data.TaggedClass("DomainFactory")<DomainConfig<TCategoryConfig, TKindConfig, TDomainConfig>> {
  readonly type: TDomainConfig["type"];
  readonly description: TDomainConfig["description"];
  readonly fields: TDomainConfig["fields"];
  readonly createOperator: <const TOperatorConfig extends OperatorConfigBase>(
    config: Omit<
      OperatorConfig<TCategoryConfig, TKindConfig, TDomainConfig, TOperatorConfig>,
      "domain" | "kind" | "category"
    >["operator"]
  ) => OperatorDef<TCategoryConfig, TKindConfig, TDomainConfig, TOperatorConfig>;

  constructor(readonly params: DomainConfig<TCategoryConfig, TKindConfig, TDomainConfig>) {
    super(params);
    this.createOperator = <const TOperatorConfig extends OperatorConfigBase>(
      config: Omit<
        OperatorConfig<TCategoryConfig, TKindConfig, TDomainConfig, TOperatorConfig>,
        "domain" | "kind" | "category"
      >["operator"]
    ) =>
      new OperatorDef({
        category: this.params.category,
        kind: this.params.kind,
        domain: this,
        operator: config,
      });
    this.type = params.domain.type;
    this.description = params.domain.description;
    this.fields = params.domain.fields;
  }
}

type KindConfigBase = {
  readonly operator: StringTypes.NonEmptyString<string>;
  readonly symbol: StringTypes.NonEmptyString<string>;
  readonly requiresValue: boolean;
  readonly isNegatable: boolean;
  readonly description: StringTypes.NonEmptyString<string>;
  readonly fields: StructTypes.StructFieldsWithStringKeys;
};

type KindConfig<TCategoryConfig extends CategoryConfigBase, TKindConfigConfig extends KindConfigBase> = {
  readonly category: CategoryFactory<TCategoryConfig>;
  readonly kindConfig: {
    readonly [K in keyof TKindConfigConfig]: TKindConfigConfig[K];
  };
};

export class KindFactory<
  const TCategoryConfig extends CategoryConfigBase,
  const TKindConfig extends KindConfigBase,
> extends Data.TaggedClass("KindFactory")<KindConfig<TCategoryConfig, TKindConfig>> {
  readonly operator: TKindConfig["operator"];
  readonly symbol: TKindConfig["symbol"];
  readonly requiresValue: TKindConfig["requiresValue"];
  readonly isNegatable: TKindConfig["isNegatable"];
  readonly description: TKindConfig["description"];
  readonly fields: TKindConfig["fields"];

  readonly createDomain: <const TDomainConfig extends DomainConfigBase>(
    config: Omit<DomainConfig<TCategoryConfig, TKindConfig, TDomainConfig>, "kind" | "category">["domain"]
  ) => DomainFactory<TCategoryConfig, TKindConfig, TDomainConfig>;

  constructor(readonly params: KindConfig<TCategoryConfig, TKindConfig>) {
    super(params);
    this.operator = params.kindConfig.operator;
    this.symbol = params.kindConfig.symbol;
    this.requiresValue = params.kindConfig.requiresValue;
    this.isNegatable = params.kindConfig.isNegatable;
    this.description = params.kindConfig.description;
    this.fields = params.kindConfig.fields;
    this.createDomain = <const TDomainConfig extends DomainConfigBase>(
      config: Omit<DomainConfig<TCategoryConfig, TKindConfig, TDomainConfig>, "kind" | "category">["domain"]
    ) =>
      new DomainFactory({
        category: this.params.category,
        kind: this,
        domain: config,
      });
  }
}

type CategoryConfigBase = {
  readonly category: StringTypes.NonEmptyString<string>;
  readonly description: StringTypes.NonEmptyString<string>;
  readonly fields: StructTypes.StructFieldsWithStringKeys;
};

type CategoryConfig<TCategoryConfig extends CategoryConfigBase> = {
  readonly categoryConfig: {
    readonly [K in keyof TCategoryConfig]: TCategoryConfig[K];
  };
};

export class CategoryFactory<const TCategoryConfig extends CategoryConfigBase> extends Data.TaggedClass(
  "CategoryFactory"
)<CategoryConfig<TCategoryConfig>> {
  readonly category: TCategoryConfig["category"];
  readonly categoryDescription: TCategoryConfig["description"];
  readonly fields: TCategoryConfig["fields"];

  readonly createKind: <const TKindConfig extends KindConfigBase>(
    config: Omit<KindConfig<TCategoryConfig, TKindConfig>, "category">["kindConfig"]
  ) => KindFactory<TCategoryConfig, TKindConfig>;

  constructor(readonly config: CategoryConfig<TCategoryConfig>["categoryConfig"]) {
    super({ categoryConfig: config });
    this.category = config.category;
    this.categoryDescription = config.description;
    this.fields = config.fields;
    this.createKind = <const TKindConfig extends KindConfigBase>(
      config: Omit<KindConfig<TCategoryConfig, TKindConfig>, "category">["kindConfig"]
    ) => {
      return new KindFactory({
        category: this,
        kindConfig: config,
      });
    };
  }
}
