import {
  $ScratchId, RepoPkgs as _RepoPkgs, type IdentityString,
} from "@beep/identity";
import * as Struct from "@beep/utils/Struct";

import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import {pipe, cast, SchemaTransformation, identity} from "effect";
import {LiteralKit, NonEmptyTrimmedStr, Markdown} from "@beep/schema";
import {Str, A} from "@beep/utils";
import {dual} from "effect/Function";

const $I = $ScratchId.create("architecture");

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
          repoPackageMetadata: S.decodeUnknownSync(CanonicalSlicePkgDefinition)(opts),
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
