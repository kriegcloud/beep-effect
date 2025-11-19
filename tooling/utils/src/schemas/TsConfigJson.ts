import * as F from "effect/Function";
import * as S from "effect/Schema";

// Helpers
const Nullable = <A, I = A, R = never>(schema: S.Schema<A, I, R>) => S.Union(schema, S.Null);

const arrayUnique = <A>(item: S.Schema<A>) =>
  S.Array(item).pipe(
    S.filter((arr) => new Set(arr.map((x) => JSON.stringify(x))).size === arr.length || "array items must be unique")
  );

// const atLeastOneOf = <K extends readonly string[]>(...keys: K) =>
//   S.filter((o: Record<string, unknown>) => keys.some((k) => k in o) || `at least one of: ${keys.join(", ")}`);

// Case-insensitive string enum helper
const stringEnumCI = <L extends readonly [string, ...string[]]>(...lits: L) =>
  S.String.pipe(S.filter((s) => lits.includes(s.toLowerCase() as L[number]) || `expected one of: ${lits.join(", ")}`));

// Common enums
const Jsx = S.Literal("react", "react-jsx", "react-jsxdev", "preserve", "react-native");
const NewLine = S.Literal("crlf", "lf");
const ModuleKind = S.Literal(
  "none",
  "commonjs",
  "amd",
  "umd",
  "system",
  "es6",
  "es2015",
  "es2020",
  "ES2023",
  "esnext",
  "node16",
  "node18",
  "node20",
  "nodenext",
  "preserve"
);
const ModuleResolution = S.Literal("classic", "node", "node10", "node16", "nodenext", "bundler");
const Target = stringEnumCI(
  "es3",
  "es5",
  "es6",
  "es2015",
  "es2016",
  "es2017",
  "es2018",
  "es2019",
  "es2020",
  "es2021",
  "ES2023",
  "esnext"
);

// Note: The official JSON schema enumerates many lib names. Start permissive; tighten later if desired.
const TsLib = S.String;

// ---------------------
// Small containers first
// ---------------------

const FilesDefinitionFields = {
  files: S.optional(
    arrayUnique(Nullable(S.String)).annotations({
      description: "If no 'files' or 'include' is present, the compiler includes all files except those in 'exclude'.",
    })
  ),
};
export const FilesDefinition = S.Struct(FilesDefinitionFields).annotations({
  description: "Top-level files list",
});

const ExcludeDefinitionFields = {
  exclude: S.optional(
    arrayUnique(Nullable(S.String)).annotations({
      description: "List of globs or paths to exclude from compilation.",
    })
  ),
};
export const ExcludeDefinition = S.Struct(ExcludeDefinitionFields).annotations({
  description: "Exclude globs",
});

const IncludeDefinitionFields = {
  include: S.optional(
    arrayUnique(Nullable(S.String)).annotations({
      description: "List of globs that match files to include in compilation.",
    })
  ),
};
export const IncludeDefinition = S.Struct(IncludeDefinitionFields).annotations({
  description: "Include globs",
});

const CompileOnSaveDefinitionFields = {
  compileOnSave: S.optional(
    Nullable(S.Boolean).annotations({
      description: "Enable Compile-on-Save for this project.",
    })
  ),
};
export const CompileOnSaveDefinition = S.Struct(CompileOnSaveDefinitionFields).annotations({
  description: "Compile-on-Save option",
});

const ExtendsDefinitionFields = {
  extends: S.optional(
    S.Union(S.String, S.Array(S.String)).annotations({
      description: "Path(s) to base configuration file(s) to inherit from.",
    })
  ),
};
export const ExtendsDefinition = S.Struct(ExtendsDefinitionFields).annotations({
  description: "Extends config",
});

// ---------------------
// References
// ---------------------
export const ProjectReference = S.Struct({
  path: S.String,
  circular: S.optional(S.Boolean),
  prepend: S.optional(S.Boolean),
}).annotations({ description: "A single project reference" });

const ReferencesDefinitionFields = {
  references: S.optional(Nullable(arrayUnique(ProjectReference))),
};
export const ReferencesDefinition = S.Struct(ReferencesDefinitionFields).annotations({
  description: "Project references for composite builds.",
});

// ---------------------
// Watch Options
// ---------------------
const WatchOptions = S.Struct({
  watchFile: S.optional(Nullable(S.String)),
  watchDirectory: S.optional(Nullable(S.String)),
  fallbackPolling: S.optional(Nullable(S.String)),
  synchronousWatchDirectory: S.optional(Nullable(S.Boolean)),
  excludeFiles: S.optional(Nullable(arrayUnique(S.String))),
  excludeDirectories: S.optional(Nullable(arrayUnique(S.String))),
}).annotations({ description: "Settings for watch mode in TypeScript." });

const WatchOptionsDefinitionFields = {
  watchOptions: S.optional(Nullable(WatchOptions)),
};
export const WatchOptionsDefinition = S.Struct(WatchOptionsDefinitionFields).annotations({
  description: "Container for watch options.",
});

// ---------------------
// Build Options
// ---------------------
const BuildOptions = S.Struct({
  dry: S.optional(Nullable(S.Boolean)).annotations({
    description: "Do not actually build; show what would be done.",
  }),
  force: S.optional(Nullable(S.Boolean)).annotations({
    description: "Build all projects, even if up-to-date.",
  }),
  verbose: S.optional(Nullable(S.Boolean)),
  incremental: S.optional(Nullable(S.Boolean)),
  assumeChangesOnlyAffectDirectDependencies: S.optional(Nullable(S.Boolean)),
  traceResolution: S.optional(Nullable(S.Boolean)),
}).annotations({ description: "Options for tsc --build mode." });

const BuildOptionsDefinitionFields = {
  buildOptions: S.optional(Nullable(BuildOptions)),
};
export const BuildOptionsDefinition = S.Struct(BuildOptionsDefinitionFields).annotations({
  description: "Container for --build options.",
});

// ---------------------
// Compiler Options (subset; extend iteratively)
// ---------------------
const CompilerOptions = S.Struct(
  {
    // Emission
    declaration: S.optional(Nullable(S.Boolean)).annotations({
      description: "Generate .d.ts files.",
    }),
    declarationDir: S.optional(Nullable(S.String)),
    emitDeclarationOnly: S.optional(Nullable(S.Boolean)),
    outDir: S.optional(Nullable(S.String)),
    outFile: S.optional(Nullable(S.String)),
    sourceMap: S.optional(Nullable(S.Boolean)),
    inlineSources: S.optional(Nullable(S.Boolean)),
    inlineSourceMap: S.optional(Nullable(S.Boolean)),
    removeComments: S.optional(Nullable(S.Boolean)),
    newLine: S.optional(Nullable(NewLine)),

    // Module resolution
    module: S.optional(Nullable(ModuleKind)),
    moduleResolution: S.optional(Nullable(ModuleResolution)),
    baseUrl: S.optional(Nullable(S.String)),
    paths: S.optional(Nullable(S.Record({ key: S.String, value: S.Array(S.String) }))),
    rootDir: S.optional(Nullable(S.String)),
    rootDirs: S.optional(Nullable(arrayUnique(S.String))),
    types: S.optional(Nullable(arrayUnique(S.String))),
    typeRoots: S.optional(Nullable(arrayUnique(S.String))),
    resolveJsonModule: S.optional(Nullable(S.Boolean)),
    allowImportingTsExtensions: S.optional(Nullable(S.Boolean)),

    // Language/target
    target: S.optional(Nullable(Target)),
    lib: S.optional(Nullable(arrayUnique(TsLib))).annotations({
      description: "Bundled library declaration files.",
    }),
    jsx: S.optional(Nullable(Jsx)),
    jsxFactory: S.optional(Nullable(S.String)),
    jsxFragmentFactory: S.optional(Nullable(S.String)),
    jsxImportSource: S.optional(Nullable(S.String)),

    // Strictness and checks
    strict: S.optional(Nullable(S.Boolean)),
    noImplicitAny: S.optional(Nullable(S.Boolean)),
    noImplicitOverride: S.optional(Nullable(S.Boolean)),
    noUnusedLocals: S.optional(Nullable(S.Boolean)),
    noUnusedParameters: S.optional(Nullable(S.Boolean)),
    noFallthroughCasesInSwitch: S.optional(Nullable(S.Boolean)),
    noUncheckedIndexedAccess: S.optional(Nullable(S.Boolean)),
    exactOptionalPropertyTypes: S.optional(Nullable(S.Boolean)),
    useUnknownInCatchVariables: S.optional(Nullable(S.Boolean)),

    // Interop and emit tweaks
    esModuleInterop: S.optional(Nullable(S.Boolean)),
    allowSyntheticDefaultImports: S.optional(Nullable(S.Boolean)),
    isolatedModules: S.optional(Nullable(S.Boolean)),
    preserveConstEnums: S.optional(Nullable(S.Boolean)),

    // Project references / incremental
    composite: S.optional(Nullable(S.Boolean)),
    incremental: S.optional(Nullable(S.Boolean)),
    tsBuildInfoFile: S.optional(Nullable(S.String)),
    assumeChangesOnlyAffectDirectDependencies: S.optional(Nullable(S.Boolean)),

    // Diagnostics / logging
    diagnostics: S.optional(Nullable(S.Boolean)),
    listEmittedFiles: S.optional(Nullable(S.Boolean)),
    listFiles: S.optional(Nullable(S.Boolean)),
    traceResolution: S.optional(Nullable(S.Boolean)),
  },
  S.Record({ key: S.String, value: S.Any })
).annotations({
  description: "TypeScript compiler options controlling emit, checking, and module resolution.",
});

const CompilerOptionsDefinitionFields = {
  compilerOptions: S.optional(Nullable(CompilerOptions)),
};
export const CompilerOptionsDefinition = S.Struct(CompilerOptionsDefinitionFields).annotations({
  description: "Container for compilerOptions",
});

// ---------------------
// Type Acquisition
// ---------------------
const TypeAcquisition = S.Struct({
  enable: S.optional(Nullable(S.Boolean)),
  include: S.optional(Nullable(arrayUnique(S.String))),
  exclude: S.optional(Nullable(arrayUnique(S.String))),
  disableFilenameBasedTypeAcquisition: S.optional(Nullable(S.Boolean)),
}).annotations({ description: "Automatic type acquisition settings." });

const TypeAcquisitionDefinitionFields = {
  typeAcquisition: S.optional(Nullable(TypeAcquisition)),
};
export const TypeAcquisitionDefinition = S.Struct(TypeAcquisitionDefinitionFields).annotations({
  description: "Container for type acquisition settings.",
});

// ---------------------
// ts-node
// ---------------------
const TsNodeModuleTypes = S.Record({
  key: S.String,
  value: S.Literal("cjs", "esm", "package"),
}).annotations({
  description: "Override paths to compile/execute as CJS, ESM or 'package' mode.",
});

const TsNode = S.Struct({
  compiler: S.optional(Nullable(S.String)),
  transpileOnly: S.optional(Nullable(S.Boolean)),
  files: S.optional(Nullable(S.Boolean)),
  moduleTypes: S.optional(Nullable(TsNodeModuleTypes)),
}).annotations({ description: "ts-node options" });

const TsNodeDefinitionFields = {
  ["ts-node" as const]: S.optional(Nullable(TsNode)),
};
export const TsNodeDefinition = S.Struct(TsNodeDefinitionFields).annotations({
  description: "Container for ts-node options.",
});

// ---------------------
// Top-level TsConfig schema
// ---------------------
/**
 * Effect Schema representation of tsconfig.json encompassing compiler options,
 * file includes/excludes, references, and build/watch settings.
 *
 * At least one known top-level property must be present.
 */
export const TsConfigJson = S.Struct({
  ...CompilerOptionsDefinitionFields,
  ...CompileOnSaveDefinitionFields,
  ...TypeAcquisitionDefinitionFields,
  ...ExtendsDefinitionFields,
  ...WatchOptionsDefinitionFields,
  ...BuildOptionsDefinitionFields,
  ...TsNodeDefinitionFields,
  ...FilesDefinitionFields,
  ...ExcludeDefinitionFields,
  ...IncludeDefinitionFields,
  ...ReferencesDefinitionFields,
})
  .pipe(
    S.filter((o) => F.pipe(Object.keys(o), (keys) => keys.some((k) => k in o) || `at least one of: ${keys.join(", ")}`))
  )
  .annotations({
    title: "JSON schema for the TypeScript compiler's configuration file",
    description: "Effect Schema representation of tsconfig.json",
  });

export type TsConfigJsonType = S.Schema.Type<typeof TsConfigJson>;
