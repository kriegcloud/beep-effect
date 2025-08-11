import * as S from "effect/Schema";

export namespace License {
  export const Schema = S.Union(
    S.String,
    S.Literal(
      "AGPL-3.0-only",
      "Apache-2.0",
      "BSD-2-Clause",
      "BSD-3-Clause",
      "BSL-1.0",
      "CC0-1.0",
      "CDDL-1.0",
      "CDDL-1.1",
      "EPL-1.0",
      "EPL-2.0",
      "GPL-2.0-only",
      "GPL-3.0-only",
      "ISC",
      "LGPL-2.0-only",
      "LGPL-2.1-only",
      "LGPL-2.1-or-later",
      "LGPL-3.0-only",
      "LGPL-3.0-or-later",
      "MIT",
      "MPL-2.0",
      "MS-PL",
      "UNLICENSED",
    ),
  );

  export type Type = typeof Schema.Type;
}

export namespace Scripts {
  export const Schema = S.Record({ key: S.String, value: S.String });
  export type Type = typeof Schema.Type;
}

export namespace Bin {
  export const Schema = S.Union(
    S.String,
    S.Record({ key: S.String, value: S.String }),
  );
  export type Type = typeof Schema.Type;
}

export namespace Repository {
  export const Schema = S.Union(
    S.String,
    S.Struct({
      type: S.optional(S.String),
      url: S.optional(S.String),
      directory: S.optional(S.String),
    }),
  );

  export type Type = typeof Schema.Type;
}

export namespace Bugs {
  export const Schema = S.Union(
    S.String,
    S.Struct({
      url: S.optional(S.String),
      email: S.optional(S.String),
    }),
  );
  export type Type = typeof Schema.Type;
}

namespace FundingUrl {
  export const Schema = S.String;
  export type Type = typeof Schema.Type;
}
export namespace FundingWay {
  export const Schema = S.Struct({
    url: FundingUrl.Schema,
    type: S.optional(S.String),
  });
  export type Type = typeof Schema.Type;
}

export namespace Funding {
  export const Schema = S.Union(
    FundingUrl.Schema,
    FundingWay.Schema,
    S.Array(S.Union(FundingUrl.Schema, FundingWay.Schema)),
  );

  export type Type = typeof Schema.Type;
}

export namespace Workspaces {
  export const Schema = S.Union(
    S.Array(S.String),
    S.Struct({
      packages: S.Array(S.String),
      nohoist: S.optional(S.Array(S.String)),
    }),
  );

  export type Type = typeof Schema.Type;
}

export namespace Person {
  export const Schema = S.Union(
    S.NonEmptyTrimmedString,
    S.Struct({
      name: S.NonEmptyTrimmedString,
      url: S.optional(S.String),
      email: S.optional(S.String),
    }),
  );
}

export namespace DependencyMap {
  export const Schema = S.Record({
    key: S.String,
    value: S.String,
  });
}

export namespace PackageJsonBase {
  export const Schema = S.Struct({
    // Required
    name: S.NonEmptyTrimmedString,
    // Optional
    version: S.optional(S.String),
    description: S.optional(S.String),
    keywords: S.optional(S.Array(S.String)),
    homepage: S.optional(S.String),
    bugs: S.optional(Bugs.Schema),
    license: S.optional(License.Schema),
    licenses: S.optional(
      S.Array(
        S.Struct({
          type: S.optional(License.Schema),
          url: S.optional(S.String),
        }),
      ),
    ),
    author: S.optional(Person.Schema),
    contributors: S.optional(S.Array(Person.Schema)),
    maintainers: S.optional(S.Array(Person.Schema)),
    files: S.optional(S.Array(S.String)),
    main: S.optional(S.String),
    bin: S.optional(Bin.Schema),
    type: S.optional(S.Literal("commonjs", "module")),
    types: S.optional(S.String),
    typings: S.optional(S.String),
    man: S.optional(S.Union(S.String, S.Array(S.String))),
    directories: S.optional(
      S.Struct({
        bin: S.optional(S.String),
        doc: S.optional(S.String),
        example: S.optional(S.String),
        lib: S.optional(S.String),
        man: S.optional(S.String),
        test: S.optional(S.String),
      }),
    ),
    repository: S.optional(Repository.Schema),
    funding: S.optional(Funding.Schema),
    scripts: S.optional(Scripts.Schema),
    config: S.optional(S.Record({ key: S.String, value: S.Any })),
    dependencies: S.optional(DependencyMap.Schema),
    devDependencies: S.optional(DependencyMap.Schema),
    optionalDependencies: S.optional(DependencyMap.Schema),
    peerDependencies: S.optional(DependencyMap.Schema),
    bundleDependencies: S.optional(S.Union(S.Array(S.String), S.Boolean)),
    bundledDependencies: S.optional(S.Union(S.Array(S.String), S.Boolean)),
    resolutions: S.optional(S.Record({ key: S.String, value: S.Any })),
    overrides: S.optional(S.Record({ key: S.String, value: S.Any })),
    packageManager: S.optional(S.String),
    engines: S.optional(S.Record({ key: S.String, value: S.String })),
    os: S.optional(S.Array(S.String)),
    cpu: S.optional(S.Array(S.String)),
    preferGlobal: S.optional(S.Boolean),
    private: S.optional(S.Union(S.Boolean, S.Literal("true", "false"))),
    publishConfig: S.optional(S.Record({ key: S.String, value: S.Any })),
    readme: S.optional(S.String),
    module: S.optional(S.String),
    workspaces: S.optional(Workspaces.Schema),
  });

  export type Type = typeof Schema.Type;
}

export namespace PackageJson {
  export const Schema = S.Struct(
    PackageJsonBase.Schema.fields,
    S.Record({ key: S.String, value: S.Any }),
  );
  export type Type = typeof Schema.Type;
}

export namespace RootPackageJson {
  export const Schema = S.Struct({
    ...PackageJsonBase.Schema.omit("workspaces").fields,
    workspaces: S.NonEmptyArray(S.NonEmptyTrimmedString),
  });
  export type Type = typeof Schema.Type;
}
