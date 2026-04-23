import {
  $ScratchId, RepoPkgs as _RepoPkgs, type IdentityString,
} from "@beep/identity";
import * as Struct from "@beep/utils/Struct";
import type {TString} from "@beep/types";
import type * as TF from "type-fest";
import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import {pipe, cast, SchemaTransformation, Result, identity} from "effect";
import {
  LiteralKit, NonEmptyTrimmedStr, Markdown, KebabCaseStr, CauseTaggedError,
} from "@beep/schema";
import {Str, A} from "@beep/utils";
import {dual} from "effect/Function";


const $I = $ScratchId.create("architecture");

export class MetadataError extends CauseTaggedError<MetadataError>($I`MetadataError`)(
  "ArchitectureMetadataError",
  {},
  $I.annote(
    "MetadataError",
    {
      description: "MetadataError - A parse error from factoring constant" + " fibers out of fat products during fibration",
    },
  ),
) {
}

type IdentifierSource = Readonly<Record<string, {
  readonly identifier: string
}>>;
type NonEmptyStringKeyRecord<R extends object> = [keyof R & string] extends [never]
  ? never
  : R;

type IdentifiersOf<Pkgs extends IdentifierSource> = A.NonEmptyReadonlyArray<Pkgs[keyof Pkgs & string]["identifier"]>;
type IdentifierEnumMappingsOf<Pkgs extends IdentifierSource> = A.NonEmptyReadonlyArray<{
  readonly [K in keyof Pkgs & string]: readonly [
    Pkgs[K]["identifier"], IdentityStringValue<Pkgs[K]["identifier"]>,
  ];
}[keyof Pkgs & string]>;

export type RepoPkgIdentifierByAccessor = {
  readonly [K in keyof typeof _RepoPkgs]: (typeof _RepoPkgs)[K]["identifier"];
};

type IdentityStringValue<T extends string> = T extends IdentityString<infer Value>
  ? Value
  : never;

export type RepoPkgIdentityString = RepoPkgIdentifierByAccessor[keyof RepoPkgIdentifierByAccessor];

export type RepoPkgIdentityLiteral = IdentityStringValue<RepoPkgIdentityString>;

export const identifiersOf = <const Pkgs extends IdentifierSource>(pkgs: Pkgs & NonEmptyStringKeyRecord<Pkgs>): IdentifiersOf<Pkgs> => cast(pipe(
  Struct.entries(pkgs),
  A.map(([, composer]) => composer.identifier),
));

export const identifierEnumMappingsOf = <const Pkgs extends IdentifierSource>(pkgs: Pkgs & NonEmptyStringKeyRecord<Pkgs>): IdentifierEnumMappingsOf<Pkgs> => cast(pipe(
  Struct.entries(pkgs),
  A.map(([, composer]) => Tuple.make(
    composer.identifier,
    composer.identifier,
  )),
));

export const repoPkgIdentifiers = identifiersOf(_RepoPkgs);
export const repoPkgIdentifierEnumMappings = identifierEnumMappingsOf(_RepoPkgs);

export const RepoPkg = LiteralKit(
  repoPkgIdentifiers,
  repoPkgIdentifierEnumMappings,
)
  .pipe($I.annoteSchema(
    "RepoPkg",
    {
      description: "RepoPkg - The identity strings for repository packages",
    },
  ));

export type RepoPkg = typeof RepoPkg.Type;

export const repoCliId = RepoPkg.Enum["@beep/repo-cli"]
export const repoCliIdThunk: () => IdentityString<"@beep/repo-cli"> = RepoPkg.thunk["@beep/repo-cli"]
export const isRepoCliId: (i: unknown) => i is IdentityString<"@beep/repo-cli"> = RepoPkg.is["@beep/repo-cli"]

export const RepoScope = S.Literal("@beep")
  .pipe($I.annoteSchema(
    "RepoScope",
    {
      description: "RepoScope - The scope of the repository",
    },
  ));

export type RepoScope = typeof RepoScope.Type;

export const RepoPkgMetadataKey = "repoPackageMetadata" as const;

declare module "effect/Schema" {
  namespace Annotations {
    interface Annotations {
      readonly repoPackageMetadata?: CanonicalSlicePkgDefinition;
      readonly useCaseRoleMetadata?: UseCaseRoleDefinition;
    }
  }
}

/**
 * CanonicalSlicePkgDefinition - The metadata for a slice package
 */
export class CanonicalSlicePkgDefinition extends S.Class<CanonicalSlicePkgDefinition>($I`CanonicalSlicePkgDefinition`)(
  {
    /** The folder name for the canonical slice package */
    folderName: NonEmptyTrimmedStr.check(S.isLowercased({
      message: "Folder name must be lowercased",
    }))
      .annotateKey({
        description: "The folder name for the canonical slice package",
      }),
    documentation: Markdown,
  },
  $I.annote(
    "CanonicalSlicePkgDefinition",
    {
      description: "CanonicalSlicePkgDefinition - The metadata for a slice" + " package",
    },
  ),
) {
  static readonly define: {
    <const TKind extends CannonicalSlicePackage>(
      kind: TKind,
      opts: CanonicalSlicePkgDefinition.Encoded,
    ): S.Literal<TKind>
    (opts: CanonicalSlicePkgDefinition.Encoded): <const TKind extends CannonicalSlicePackage>(kind: TKind) => S.Literal<TKind>
  } = dual(
    2,
    <const TKind extends CannonicalSlicePackage>(
      kind: TKind,
      opts: CanonicalSlicePkgDefinition.Encoded,
    ): S.Literal<TKind> => {
      const capitalKind = Str.capitalize(kind)
      return S.Literal(kind)
        .annotate({
          identifier: `${$I.identifier}/Slice${capitalKind}Package`,
          title: `Slice ${capitalKind} Package`,
          description: `The Canonical Slice Package definition for ${capitalKind}`,
          repoPackageMetadata: S.decodeUnknownSync(CanonicalSlicePkgDefinition)(
            opts),
        })
    },
  )
}

export const SliceDomainPackage = CanonicalSlicePkgDefinition.define(
  "domain",
  {
    documentation: Markdown.make(""),
    folderName: NonEmptyTrimmedStr.make("domain"),
  },
)

export declare namespace CanonicalSlicePkgDefinition {
  export type Encoded = typeof CanonicalSlicePkgDefinition.Encoded
}


/**
 * SliceDomainPkg - An effect/Schema for the literal value of the slice
 * domain package
 */

/**
 * CanonicalSlicePackage - An schema union of string literals for a vertical slices canonical packages
 *
 * @category Configuration
 * @since 0.0.0
 */
export const CannonicalSlicePackage = LiteralKit([
  "config",
  "domain",
  "use-case",
  "server",
  "client",
  "tables",
  "ui",
])
  .pipe($I.annoteSchema(
    "CannonicalSlicePackage",
    {
      description: "CanonicalSlicePackage - An schema union of string literals for a vertical slices canonical packages",
    },
  ));

export const SliceNameFormat = S.String.pipe(
  S.decodeTo(
    NonEmptyTrimmedStr.check(S.isLowercased()),
    SchemaTransformation.transform({
      decode: Str.toLowerCase,
      encode: identity,
    }),
  ),
  S.brand("SliceNameFormat"),
  $I.annoteSchema(
    "SliceNameFormat",
    {
      description: "SliceNameFormat - A schema for a slice name format",
    },
  ),
);

export type SliceNameFormat = typeof SliceNameFormat.Type;


export const RepoPkgCategory = LiteralKit([
  "common",
  "internal",
  "slice",
  "provider",
  "tooling",
  "agent_config",
  "scratch",
])
  .pipe($I.annoteSchema(
    "RepoPkgCategory",
    {
      description: "RepoPkgCategory - An schema union of string literals for a repository package category",
    },
  ))


/**
 * Type of {@link CannonicalSlicePackage} {@inheritDoc CannonicalSlicePackage}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type CannonicalSlicePackage = typeof CannonicalSlicePackage.Type;


export const NonSliceFamilyKind = LiteralKit([
  "foundation",
  "drivers",
  "tooling",
  "agents",
])
  .pipe($I.annoteSchema(
    "NonSliceFamilyKind",
    {
      description: "Canonical non-slice package families in the repository.",
    },
  ))

export type NonSliceFamilyKind = typeof NonSliceFamilyKind.Type;

/**
 * FoundationCanonicalKind -
 *
 * @category Configuration
 * @since 0.0.0
 */
export const FoundationCanonicalKind = LiteralKit([
  "primitive",
  "modeling",
  "capability",
  "ui-system",
])
  .pipe($I.annoteSchema(
    "FoundationCanonicalKind",
    {
      description: "Canonical kinds used across foundation packages.",
    },
  ));

/**
 * Type of {@link FoundationCanonicalKind} {@inheritDoc FoundationCanonicalKind}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type FoundationCanonicalKind = typeof FoundationCanonicalKind.Type;


/**
 * ToolingCanonicalKind -
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ToolingCanonicalKind = LiteralKit([
  "library",
  "tool",
  "policy-pack",
  "test-kit",
])
  .pipe($I.annoteSchema(
    "ToolingCanonicalKind",
    {
      description: "Canonical kinds used by tooling packages.",
    },
  ));

/**
 * Type of {@link ToolingCanonicalKind} {@inheritDoc ToolingCanonicalKind}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ToolingCanonicalKind = typeof ToolingCanonicalKind.Type;

/**
 * AgentCanonicalKind
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AgentCanonicalKind = LiteralKit([
  "skill-pack",
  "policy-pack",
  "runtime-adapter",
])
  .pipe($I.annoteSchema(
    "AgentCanonicalKind",
    {
      description: "Canonical kinds used by repo-local agent bundles.",
    },
  ));

/**
 * Type of {@link AgentCanonicalKind} {@inheritDoc AgentCanonicalKind}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type AgentCanonicalKind = typeof AgentCanonicalKind.Type;

export const FoundationPrimitiveAnchor = LiteralKit([
  "browser",
])
  .pipe($I.annoteSchema(
    "FoundationPrimitiveAnchor",
    {
      description: "Anchor vocabulary used by foundation primitive packages.",
    },
  ))

export type FoundationPrimitiveAnchor = typeof FoundationPrimitiveAnchor.Type;

/**
 * FoundationModelingAnchor -
 *
 * @category Configuration
 * @since 0.0.0
 */
export const FoundationModelingAnchor = LiteralKit([
  "schema",
  "brand",
  "codec",
])
  .pipe($I.annoteSchema(
    "FoundationModelingAnchor",
    {
      description: "Anchor vocabulary used by foundation modeling packages.",
    },
  ));

/**
 * Type of {@link FoundationModelingAnchor} {@inheritDoc FoundationModelingAnchor}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type FoundationModelingAnchor = typeof FoundationModelingAnchor.Type;

/**
 * FoundationCapabilityAnchor
 *
 * @category Configuration
 * @since 0.0.0
 */
export const FoundationCapabilityAnchor = LiteralKit([
  "service",
  "layer",
  "schema",
  "errors",
  "client",
])
  .pipe($I.annoteSchema(
    "FoundationCapabilityAnchor",
    {
      description: "Anchor vocabulary used by foundation capability packages.",
    },
  ));

/**
 * Type of {@link FoundationCapabilityAnchor} {@inheritDoc FoundationCapabilityAnchor}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type FoundationCapabilityAnchor = typeof FoundationCapabilityAnchor.Type;

/**
 * DriverAnchor
 *
 * @category Configuration
 * @since 0.0.0
 */
export const DriverAnchor = LiteralKit([
  "service",
  "layer",
  "errors",
  "config",
  "browser",
  "test-layer",
])
  .pipe($I.annoteSchema(
    "DriverAnchor",
    {
      description: "Anchor vocabulary used by flat repo-level driver packages.",
    },
  ));

/**
 * Type of {@link DriverAnchor} {@inheritDoc DriverAnchor}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type DriverAnchor = typeof DriverAnchor.Type;

/**
 * ToolingAnchor
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ToolingAnchor = LiteralKit([
  "command",
  "service",
  "schema",
])
  .pipe($I.annoteSchema(
    "ToolingAnchor",
    {
      description: "Anchor vocabulary shared across tooling packages.",
    },
  ));

/**
 * Type of {@link ToolingAnchor} {@inheritDoc ToolingAnchor}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ToolingAnchor = typeof ToolingAnchor.Type;

/**
 * ToolingPolicyPackAnchor
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ToolingPolicyPackAnchor = LiteralKit([
  "policy",
])
  .pipe($I.annoteSchema(
    "ToolingPolicyPackAnchor",
    {
      description: "Anchor vocabulary for tooling policy-pack packages.",
    },
  ));

/**
 * Type of {@link ToolingPolicyPackAnchor} {@inheritDoc ToolingPolicyPackAnchor}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ToolingPolicyPackAnchor = typeof ToolingPolicyPackAnchor.Type;

/**
 * ToolingTestkitAnchor
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ToolingTestkitAnchor = LiteralKit([
  "test-kit",
])
  .pipe($I.annoteSchema(
    "ToolingTestkitAnchor",
    {
      description: "Anchor vocabulary for tooling test-kit packages.",
    },
  ));

/**
 * Type of {@link ToolingTestkitAnchor} {@inheritDoc ToolingTestkitAnchor}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ToolingTestkitAnchor = typeof ToolingTestkitAnchor.Type;


export const RolePostfix = KebabCaseStr
  .pipe(S.brand("RolePostfix"))

export type RolePostfix = typeof RolePostfix.Type;

export declare namespace RolePostfix {
  export type Encoded = typeof RolePostfix.Encoded
}

export class UseCaseRoleDefinition extends S.Class<UseCaseRoleDefinition>($I`UseCaseRoleDefinition`)(
  {
    value: RolePostfix,
    description: S.String,
  }) {
  static readonly define: {
    <const TValue extends TString.NonEmpty>(
      value: TF.KebabCase<TValue>,
      description: string,
    ): S.Literal<TF.KebabCase<TValue>>
    (description: string): <const TValue extends TString.NonEmpty>(value: TF.KebabCase<TValue>) => S.Literal<TF.KebabCase<TValue>>
  } = dual(
    2,
    <const TValue extends TString.NonEmpty>(
      value: TF.KebabCase<TValue>,
      description: string,
    ): S.Literal<TF.KebabCase<TValue>> => {
      const normalized = pipe(
        {
          description,
          value,
        },
        S.decodeResult(UseCaseRoleDefinition),
        Result.getOrThrowWith(MetadataError.new("Invalid UseCaseRoleDefinition")),
      );
      const capitalizedValue = Str.capitalize(normalized.value)
      return S.Literal(normalized.value)
        .annotate({
          identifier: `${$I.identifier}/${capitalizedValue}UseCaseRole`,
          title: `${capitalizedValue} UseCase Role`,
          description: normalized.description,
          useCaseRoleMetadata: normalized,
        })
    },
  )
}


export const UseCaseRoleCommand = UseCaseRoleDefinition.define(
  "command",
  "Application command envelopes and command language.",
)

export type UseCaseRoleCommand = typeof UseCaseRoleCommand.Type;

export const UseCaseRoleQueries = UseCaseRoleDefinition.define(
  "queries",
  "Application query envelopes and query language.",
)

export type UseCaseRoleQueries = typeof UseCaseRoleQueries.Type;

export const UseCaseRoleAccess = UseCaseRoleDefinition.define(
  "access",
  "Effectful authorization over domain access vocabulary.",
)
export type UseCaseRoleAccess = typeof UseCaseRoleAccess.Type;

export const UseCaseRolePorts = UseCaseRoleDefinition.define(
  "ports",
  "Product ports needed by use-cases.",
)
export type UseCaseRolePorts = typeof UseCaseRolePorts.Type;


export const UseCaseRoleService = UseCaseRoleDefinition.define(
  "service",
  "Application service contract/orchestration facade.",
)
export type UseCaseRoleService = typeof UseCaseRoleService.Type;

export const UseCaseRoleErrors = UseCaseRoleDefinition.define(
  "errors",
  "Actionable application failures.",
)

export type UseCaseRoleErrors = typeof UseCaseRoleErrors.Type;

export const UseCaseRoleHttp = UseCaseRoleDefinition.define(
  "http",
  "Driver-neutral HttpApi endpoint/group declarations"
)

export type UseCaseRoleHttp = typeof UseCaseRoleHttp.Type;

export const UseCaseRoleRpc =  UseCaseRoleDefinition.define(
  "rpc",
  "Driver-neutral Rpc/RpcGroup declarations.",
);

export type UseCaseRoleRpc = typeof UseCaseRoleRpc.Type;

export const UseCaseRoleTools =  UseCaseRoleDefinition.define(
  "tools",
  "Driver-neutral AI tool/toolkit declarations.",
);

export type UseCaseRoleTools = typeof UseCaseRoleTools.Type;

export const UseCaseRoleCluster =  UseCaseRoleDefinition.define(
  "cluster",
  "Driver-neutral cluster entity protocol definitions.",
);

export type UseCaseRoleCluster = typeof UseCaseRoleCluster.Type;

export const UseCaseRoleWorkflows =  UseCaseRoleDefinition.define(
  "workflows",
  "Durable workflow declarations or application workflow contracts.",
);

export type UseCaseRoleWorkflows = typeof UseCaseRoleWorkflows.Type;

export const UseCaseRoleProcesses =  UseCaseRoleDefinition.define(
  "processes",
  "Process managers/sagas coordinating multiple commands, events, ports, or workflows.",
);

export type UseCaseRoleProcesses = typeof UseCaseRoleProcesses.Type;

export const UseCaseRoleSchedulers =  UseCaseRoleDefinition.define(
  "schedulers",
  "Scheduler contracts or schedule declarations coordinating time-based work.",
);

export type UseCaseRoleSchedulers = typeof UseCaseRoleSchedulers.Type;


export const UseCaseRole = S.Union(
  [
    UseCaseRoleCommand,
    UseCaseRoleQueries,
    UseCaseRoleAccess,
    UseCaseRolePorts,
    UseCaseRoleService,
    UseCaseRoleErrors,
    UseCaseRoleHttp,
    UseCaseRoleRpc,
    UseCaseRoleTools,
    UseCaseRoleCluster,
    UseCaseRoleWorkflows,
    UseCaseRoleProcesses,
    UseCaseRoleSchedulers,
  ]
);

export type UseCaseRole = typeof UseCaseRole.Type;
