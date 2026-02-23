/**
 * Package.json schema.
 *
 * Effect Schema definition for package.json structure with typed fields.
 *
 * @since 0.1.0
 */
import * as S from "effect/Schema";
import { Json } from "./Json.js";

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
    "UNLICENSED"
  )
);

const Scripts = S.Record({ key: S.String, value: S.String });

const Bin = S.Union(S.String, S.Record({ key: S.String, value: S.String }));

const Repository = S.Union(
  S.String,
  S.Struct({
    type: S.optional(S.String),
    url: S.optional(S.String),
    directory: S.optional(S.String),
  })
);

const Bugs = S.Union(
  S.String,
  S.Struct({
    url: S.optional(S.String),
    email: S.optional(S.String),
  })
);

const FundingUrl = S.String;

const FundingWay = S.Struct({
  url: FundingUrl,
  type: S.optional(S.String),
});

const Funding = S.Union(FundingUrl, FundingWay, S.Array(S.Union(FundingUrl, FundingWay)));

const Workspaces = S.Union(
  S.Array(S.String),
  S.Struct({
    packages: S.Array(S.String),
    nohoist: S.optional(S.Array(S.String)),
  })
);

const Person = S.Union(
  S.NonEmptyTrimmedString,
  S.Struct({
    name: S.NonEmptyTrimmedString,
    url: S.optional(S.String),
    email: S.optional(S.String),
  })
);

const DependencyMap = S.Record({
  key: S.String,
  value: S.String,
});

/**
 * Package.json exports field condition value.
 * Can be a string path or nested conditions object.
 */
const ExportsConditionValue: S.Schema<ExportsConditionValue> = S.suspend(() =>
  S.Union(S.String, S.Null, S.Record({ key: S.String, value: ExportsConditionValue }))
);
type ExportsConditionValue = string | null | { [key: string]: ExportsConditionValue };

/**
 * Package.json exports field.
 *
 * Supports:
 * - Simple string: `"./index.js"`
 * - Conditions object: `{ "import": "./index.mjs", "require": "./index.cjs" }`
 * - Subpath exports: `{ ".": "./index.js", "./utils": "./utils.js" }`
 * - Nested conditions with subpaths
 */
const Exports = S.Union(S.String, S.Null, S.Record({ key: S.String, value: ExportsConditionValue }));

/**
 * Effect Schema representation of a package.json used by repo utilities.
 *
 * This schema focuses on fields commonly needed by tooling, including
 * script maps, dependency maps, repository metadata, and optional
 * workspaces. Additional unknown properties are allowed and captured via
 * the index signature.
 *
 * @example
 * ```typescript
 * import { PackageJson } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const pkg = S.decodeUnknownSync(PackageJson)({
 *   name: "@beep/my-package",
 *   version: "1.0.0",
 *   dependencies: {
 *     "effect": "^3.0.0"
 *   }
 * })
 *
 * console.log(pkg.name)
 * // => @beep/my-package
 * ```
 *
 * @category Schemas/Package
 * @since 0.1.0
 */
export class PackageJson extends S.Struct(
  {
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
        })
      )
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
      })
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
    exports: S.optional(Exports),
    workspaces: S.optional(Workspaces),
  },
  S.Record({ key: S.String, value: Json })
) {
  static readonly decode = S.decode(PackageJson);

  static readonly decodeUnknown = S.decodeUnknown(PackageJson);
}
