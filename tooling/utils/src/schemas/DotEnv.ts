import { NoSuchFileError } from "@beep/tooling-utils/repo/Errors";
import { findRepoRoot } from "@beep/tooling-utils/repo/Root";
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
import { EnvironmentVariableName } from "./EnvironmentVariable.js";

export const DotEnvEncoded = S.NonEmptyString;

export declare namespace DotEnvEncoded {
  export type Type = typeof DotEnvEncoded.Type;
  export type Encoded = typeof DotEnvEncoded.Encoded;
}

export const DotEnvDecoded = S.HashMap({
  key: EnvironmentVariableName,
  value: S.String,
});

export declare namespace DotEnvDecoded {
  export type Type = typeof DotEnvDecoded.Type;
  export type Encoded = typeof DotEnvDecoded.Encoded;
}

const referencePattern = /\$\{([^}]+)\}/g;
const environmentVariableNames = HashSet.fromIterable(EnvironmentVariableName.literals);
const isEnvironmentVariableName = (candidate: string): candidate is EnvironmentVariableName.Type =>
  F.pipe(environmentVariableNames, HashSet.has(candidate));

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

  getVar(key: EnvironmentVariableName.Type) {
    const env = this.env;
    return Effect.option(HashMap.get(key)(env));
  }

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

export declare namespace DotEnv {
  export type Type = typeof DotEnv.Type;
  export type Encoded = typeof DotEnv.Encoded;
}
