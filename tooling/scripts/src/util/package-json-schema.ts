import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

// --- Helper Schemas ---

const Person = S.Union(
  S.NonEmptyTrimmedString,
  S.Struct({
    name: S.NonEmptyTrimmedString,
    url: S.optional(S.String),
    email: S.optional(S.String),
  }),
);

const DependencyMap = S.Record({ key: S.String, value: S.String });

const License = S.Union(
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

const Scripts = S.Record({ key: S.String, value: S.String });

const Bin = S.Union(S.String, S.Record({ key: S.String, value: S.String }));

const Repository = S.Union(
  S.String,
  S.Struct({
    type: S.optional(S.String),
    url: S.String,
    directory: S.optional(S.String),
  }),
);

const Bugs = S.Union(
  S.String,
  S.Struct({
    url: S.optional(S.String),
    email: S.optional(S.String),
  }),
);

const FundingUrl = S.String;
const FundingWay = S.Struct({
  url: FundingUrl,
  type: S.optional(S.String),
});
const Funding = S.Union(
  FundingUrl,
  FundingWay,
  S.Array(S.Union(FundingUrl, FundingWay)),
);

const Workspaces = S.Union(
  S.Array(S.String),
  S.Struct({
    packages: S.Array(S.String),
    nohoist: S.optional(S.Array(S.String)),
  }),
);

// --- Main Class Schema ---

export const PkgJsonBase = S.Struct({
  // Required
  name: S.NonEmptyTrimmedString,
  // Optional
  version: S.optional(S.String),
  description: S.optional(S.String),
  keywords: S.optional(S.Array(S.String)),
  homepage: S.optional(S.String),
  bugs: S.optional(Bugs),
  license: S.optional(License),
  licenses: S.optional(
    S.Array(
      S.Struct({
        type: S.optional(License),
        url: S.optional(S.String),
      }),
    ),
  ),
  author: S.optional(Person),
  contributors: S.optional(S.Array(Person)),
  maintainers: S.optional(S.Array(Person)),
  files: S.optional(S.Array(S.String)),
  main: S.optional(S.String),
  bin: S.optional(Bin),
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
  repository: S.optional(Repository),
  funding: S.optional(Funding),
  scripts: S.optional(Scripts),
  config: S.optional(S.Record({ key: S.String, value: S.Any })),
  dependencies: S.optional(DependencyMap),
  devDependencies: S.optional(DependencyMap),
  optionalDependencies: S.optional(DependencyMap),
  peerDependencies: S.optional(DependencyMap),
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
  workspaces: S.optional(Workspaces),
});

export const PkgJson = S.Struct(
  PkgJsonBase.fields,
  S.Record({ key: S.String, value: S.Any }),
);

export type PkgJsonType = typeof PkgJson.Type;

export const RootPkgJson = S.Struct({
  ...PkgJsonBase.omit("workspaces").fields,
  workspaces: S.NonEmptyArray(S.NonEmptyTrimmedString),
});

export const RootPkgJsonFromString = S.transformOrFail(S.String, RootPkgJson, {
  strict: true,
  decode: (str, _, ast) => {
    try {
      const parsed = JSON.parse(str);

      // console.log(parsed);
      const hasName = "name" in parsed;
      const hasWorkspaces = "workspaces" in parsed;
      if (!hasName || !hasWorkspaces) {
        return ParseResult.fail(
          new ParseResult.Type(
            ast,
            str,
            'Invalid package.json: "name" & "workspace" field is required',
          ),
        );
      }
      return ParseResult.succeed(parsed);
    } catch (e) {
      return ParseResult.fail(
        new ParseResult.Type(ast, str, "Invalid JSON string"),
      );
    }
  },
  encode: (pkgJson, _, ast) => {
    try {
      return ParseResult.succeed(JSON.stringify(pkgJson));
    } catch (e) {
      return ParseResult.fail(
        new ParseResult.Type(ast, pkgJson, "Invalid date"),
      );
    }
  },
});

export const PkgJsonFromString = S.transformOrFail(S.String, PkgJson, {
  strict: true,
  decode: (str, _, ast) => {
    try {
      const parsed = JSON.parse(str);
      const hasName = "name" in parsed;
      if (!hasName) {
        return ParseResult.fail(
          new ParseResult.Type(
            ast,
            str,
            'Invalid package.json: "name" field is required',
          ),
        );
      }
      return ParseResult.succeed(parsed);
    } catch (e) {
      return ParseResult.fail(
        new ParseResult.Type(ast, str, "Invalid JSON string"),
      );
    }
  },
  encode: (pkgJson, _, ast) => {
    try {
      return ParseResult.succeed(JSON.stringify(pkgJson));
    } catch (e) {
      return ParseResult.fail(
        new ParseResult.Type(ast, pkgJson, "Invalid date"),
      );
    }
  },
});
