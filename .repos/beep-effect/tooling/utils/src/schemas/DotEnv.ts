/**
 * DotEnv schemas and parsing utilities.
 *
 * Provides schemas for parsing .env files with variable interpolation support.
 *
 * @since 0.1.0
 */
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { NoSuchFileError } from "../repo/Errors.js";
import { findRepoRoot } from "../repo/Root.js";
import { EnvironmentVariableName } from "./EnvironmentVariable.js";

/**
 * Schema representing raw .env file content as a non-empty string.
 *
 * @example
 * ```typescript
 * import { DotEnvEncoded } from "@beep/tooling-utils"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(DotEnvEncoded)
 * const content = decode("APP_NAME=my-app\nAPP_ENV=production")
 * ```
 *
 * @category Schemas/Environment
 * @since 0.1.0
 */
export const DotEnvEncoded = S.NonEmptyString;

/**
 * Namespace containing types for DotEnvEncoded schema.
 *
 * @example
 * ```typescript
 * import type { DotEnvEncoded } from "@beep/tooling-utils"
 *
 * const processEnv = (content: DotEnvEncoded.Type) => {
 *   // content is a non-empty string
 *   console.log(content)
 * }
 * ```
 *
 * @category Schemas/Environment
 * @since 0.1.0
 */
export declare namespace DotEnvEncoded {
  /**
   * Runtime type extracted from DotEnvEncoded schema.
   *
   * @since 0.1.0
   */
  export type Type = typeof DotEnvEncoded.Type;

  /**
   * Encoded type extracted from DotEnvEncoded schema.
   *
   * @since 0.1.0
   */
  export type Encoded = typeof DotEnvEncoded.Encoded;
}

/**
 * Schema representing parsed .env file as a HashMap of environment variables.
 *
 * @example
 * ```typescript
 * import { DotEnvDecoded } from "@beep/tooling-utils"
 * import * as HashMap from "effect/HashMap"
 *
 * const envMap = HashMap.make(
 *   ["APP_NAME", "my-app"],
 *   ["APP_ENV", "production"]
 * )
 * ```
 *
 * @category Schemas/Environment
 * @since 0.1.0
 */
export const DotEnvDecoded = S.HashMap({
  key: EnvironmentVariableName,
  value: S.String,
});

/**
 * Namespace containing types for DotEnvDecoded schema.
 *
 * @example
 * ```typescript
 * import type { DotEnvDecoded } from "@beep/tooling-utils"
 * import * as HashMap from "effect/HashMap"
 *
 * const processEnv = (env: DotEnvDecoded.Type) => {
 *   // env is a HashMap of environment variables
 *   const appName = HashMap.get(env, "APP_NAME")
 * }
 * ```
 *
 * @category Schemas/Environment
 * @since 0.1.0
 */
export declare namespace DotEnvDecoded {
  /**
   * Runtime type extracted from DotEnvDecoded schema.
   *
   * @since 0.1.0
   */
  export type Type = typeof DotEnvDecoded.Type;

  /**
   * Encoded type extracted from DotEnvDecoded schema.
   *
   * @since 0.1.0
   */
  export type Encoded = typeof DotEnvDecoded.Encoded;
}

const referencePattern = /\$\{([^}]+)\}/g;
const environmentVariableNames = HashSet.fromIterable(EnvironmentVariableName.literals);
const isEnvironmentVariableName = (candidate: string): candidate is EnvironmentVariableName.Type =>
  F.pipe(environmentVariableNames, HashSet.has(candidate));

/**
 * Parse raw .env file content into a typed HashMap.
 *
 * Features:
 * - Strips comments (lines starting with #)
 * - Handles quoted values (single and double quotes)
 * - Resolves variable references using ${VAR_NAME} syntax
 * - Filters out non-recognized environment variables
 * - Detects circular references
 *
 * @example
 * ```typescript
 * import { parseEnv } from "@beep/tooling-utils"
 * import * as HashMap from "effect/HashMap"
 *
 * const content = `
 * APP_NAME=my-app
 * APP_ENV=production
 * APP_API_URL=https://api.\${APP_DOMAIN}
 * APP_DOMAIN=example.com
 * `
 *
 * const parsed = parseEnv(content)
 * const apiUrl = HashMap.get(parsed, "APP_API_URL")
 * // => Some("https://api.example.com")
 * ```
 *
 * @category Schemas/Environment
 * @since 0.1.0
 */
export const parseEnv = (env: DotEnvEncoded.Type): DotEnvDecoded.Type => {
  const entries = F.pipe(
    env,
    Str.split("\n"),
    A.map(Str.trim),
    A.filter(P.and(P.isNotNullable, P.not(Str.startsWith("#")))),
    A.map((line) =>
      F.pipe(
        line,
        Str.indexOf("="),
        O.match({
          onNone: () => null,
          onSome: (eqIdx) =>
            F.pipe(
              {
                key: Str.trim(Str.slice(0, eqIdx)(line)),
                value: F.pipe(line, Str.slice(eqIdx + 1), Str.trim),
              } as const,
              ({ key, value }) =>
                F.pipe(
                  value,
                  P.or(P.and(Str.startsWith(`"`), Str.endsWith(`"`)), P.and(Str.startsWith(`'`), Str.endsWith(`'`))),
                  Bool.match({
                    onTrue: () => ({ key, value: Str.slice(1, -1)(value) }),
                    onFalse: () => ({ key, value }),
                  })
                )
            ),
        })
      )
    ),
    A.filter(P.isNotNullable)
  );

  const envMap: HashMap.HashMap<string, string> = F.pipe(
    entries,
    A.map(({ key, value }) => [key, value] as const),
    HashMap.fromIterable
  );

  let resolvedCache = HashMap.empty<string, string>();

  function resolveKey(targetKey: string, visited: HashSet.HashSet<string>): O.Option<string> {
    if (F.pipe(visited, HashSet.has(targetKey))) {
      return O.none();
    }

    const cached = F.pipe(resolvedCache, HashMap.get(targetKey));
    if (O.isSome(cached)) {
      return cached;
    }

    return F.pipe(
      envMap,
      HashMap.get(targetKey),
      O.map((rawValue) => {
        const resolved = resolveReferences(rawValue, F.pipe(visited, HashSet.add(targetKey)));
        resolvedCache = HashMap.set(targetKey, resolved)(resolvedCache);
        return resolved;
      })
    );
  }

  const resolveReferences = (value: string, visited: HashSet.HashSet<string>) =>
    F.pipe(
      value,
      Str.matchAll(referencePattern),
      A.fromIterable,
      A.reduce(value, (acc, match) => {
        const [matchSource, referenceKey] = match;

        if (P.isNullable(referenceKey)) {
          return acc;
        }

        return F.pipe(
          resolveKey(referenceKey, visited),
          O.match({
            onNone: () => acc,
            onSome: (resolvedReference) => F.pipe(acc, Str.replace(matchSource, resolvedReference)),
          })
        );
      })
    );

  return F.pipe(
    entries,
    A.reduce(HashMap.empty<EnvironmentVariableName.Type, string>(), (acc, { key, value }) => {
      if (!isEnvironmentVariableName(key)) {
        return acc;
      }

      const resolved = F.pipe(
        resolveKey(key, HashSet.empty<string>()),
        O.getOrElse(() => resolveReferences(value, HashSet.empty<string>()))
      );

      return F.pipe(acc, HashMap.set(key, resolved));
    })
  );
};

const serializeEnv = (map: HashMap.HashMap<EnvironmentVariableName.Type, string>): DotEnvEncoded.Type => {
  return F.pipe(
    map,
    HashMap.toEntries,
    A.fromIterable,
    A.reduce("", (acc, [key, value]) => {
      const line = F.pipe(key, Str.concat("="), Str.concat(value));

      return F.pipe(
        Str.isEmpty(acc),
        Bool.match({
          onTrue: () => line,
          onFalse: () => F.pipe(acc, Str.concat("\n"), Str.concat(line)),
        })
      );
    })
  );
};

/**
 * Effect Schema class representing a .env file with parsing and serialization.
 *
 * Provides:
 * - Bidirectional transformation between raw .env content and typed HashMap
 * - Static method to read .env from repository root
 * - Methods to access and serialize environment variables
 *
 * @example
 * ```typescript
 * import { DotEnv } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const dotEnv = yield* DotEnv.readEnvFile
 *   const appName = yield* dotEnv.getVar("APP_NAME")
 *   console.log("App name:", appName)
 * })
 * ```
 *
 * @category Schemas/Environment
 * @since 0.1.0
 */
export class DotEnv extends S.Class<DotEnv>("DotEnv")({
  env: S.transformOrFail(DotEnvEncoded, DotEnvDecoded, {
    strict: true,
    decode: (env, _, ast, __) =>
      Effect.try({
        try: () => F.pipe(parseEnv(env), HashMap.toEntries, A.fromIterable),
        catch: () => new ParseResult.Type(ast, env, "could not decode DotEnv"),
      }),
    encode: (_entries, _, ast, map) =>
      Effect.try({
        try: () => serializeEnv(map),
        catch: () => new ParseResult.Type(ast, map, "could not encode DotEnv"),
      }),
  }),
}) {
  static readonly readEnvFile = Effect.gen(function* () {
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;
    const rootDir = yield* findRepoRoot;

    const envPath = path.join(rootDir, ".env");

    if (!(yield* fs.exists(envPath))) {
      return yield* new NoSuchFileError({
        path: envPath,
      });
    }

    const envContent = yield* fs.readFileString(envPath);

    return yield* S.decode(DotEnv)({ env: envContent });
  });

  /**
   * Retrieves an environment variable value by key.
   *
   * @since 0.1.0
   */
  getVar(key: EnvironmentVariableName.Type) {
    const env = this.env;
    return Effect.option(HashMap.get(key)(env));
  }

  /**
   * Serializes the environment HashMap to a JSON string.
   *
   * @since 0.1.0
   */
  toJson() {
    const env = this.env;
    return F.pipe(
      HashMap.entries(env),
      A.reduce(
        {} as { readonly [K in EnvironmentVariableName.Type]: string },
        (acc, [key, value]) =>
          ({
            ...acc,
            [key]: value,
          }) as const
      ),
      JSON.stringify
    );
  }
}

/**
 * Namespace containing types for DotEnv schema.
 *
 * @example
 * ```typescript
 * import type { DotEnv } from "@beep/tooling-utils"
 *
 * const processEnv = (dotEnv: DotEnv.Type) => {
 *   // Work with typed DotEnv instance
 * }
 * ```
 *
 * @category Schemas/Environment
 * @since 0.1.0
 */
export declare namespace DotEnv {
  /**
   * Runtime type extracted from DotEnv schema.
   *
   * @since 0.1.0
   */
  export type Type = typeof DotEnv.Type;

  /**
   * Encoded type extracted from DotEnv schema.
   *
   * @since 0.1.0
   */
  export type Encoded = typeof DotEnv.Encoded;
}
