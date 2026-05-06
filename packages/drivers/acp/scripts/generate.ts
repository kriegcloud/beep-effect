#!/usr/bin/env node

import { $AcpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { make as makeJsonSchemaGenerator } from "@effect/openapi-generator/JsonSchemaGenerator";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { Effect, FileSystem, Layer, Logger, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import { FetchHttpClient, HttpClient, HttpClientResponse } from "effect/unstable/http";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const CURRENT_SCHEMA_RELEASE = "v0.11.3";
const GENERATED_SCHEMA_ID = '$AcpId.create("_generated/schema.gen")';
const GENERATED_META_ID = '$AcpId.create("_generated/meta.gen")';
const $I = $AcpId.create("scripts/generate");
const schemaNameOrder = Order.make<string>((left, right) => {
  const ordering = left.localeCompare(right);
  if (ordering < 0) {
    return -1;
  }
  return ordering > 0 ? 1 : 0;
});

interface GenerateCommandError {
  readonly _tag: "GenerateCommandError";
  readonly message: string;
}

interface GeneratedPaths {
  readonly generatedDir: string;
  readonly metaOutputPath: string;
  readonly schemaOutputPath: string;
  readonly upstreamMetaPath: string;
  readonly upstreamSchemaPath: string;
}

interface SchemaEntry {
  readonly code: string;
  readonly name: string;
}

class AcpGeneratorOutputError extends TaggedErrorClass<AcpGeneratorOutputError>($I`AcpGeneratorOutputError`)(
  "AcpGeneratorOutputError",
  {
    message: S.String,
  },
  $I.annote("AcpGeneratorOutputError", {
    description: "Generator output from the upstream JSON-schema converter was not in the expected shape.",
  })
) {}

class MetaJson extends S.Class<MetaJson>($I`MetaJson`)(
  {
    agentMethods: S.Record(S.String, S.String),
    clientMethods: S.Record(S.String, S.String),
    version: S.Union([S.Number, S.String]),
  },
  $I.annote("MetaJson", {
    description: "ACP upstream metadata JSON downloaded by the generator.",
  })
) {}

class UpstreamJsonSchema extends S.Class<UpstreamJsonSchema>($I`UpstreamJsonSchema`)(
  {
    $defs: S.Record(S.String, S.Json),
  },
  $I.annote("UpstreamJsonSchema", {
    description: "ACP upstream JSON Schema document downloaded by the generator.",
  })
) {}

const getGeneratedPaths = Effect.fn("getGeneratedPaths")(function* () {
  const path = yield* Path.Path;
  const generatedDir = path.join(import.meta.dirname, "..", "src", "_generated");
  return {
    generatedDir,
    upstreamSchemaPath: path.join(generatedDir, "upstream-schema.json"),
    upstreamMetaPath: path.join(generatedDir, "upstream-meta.json"),
    schemaOutputPath: path.join(generatedDir, "schema.gen.ts"),
    metaOutputPath: path.join(generatedDir, "meta.gen.ts"),
  } satisfies GeneratedPaths;
});

const ensureGeneratedDir = Effect.fn("ensureGeneratedDir")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const { generatedDir } = yield* getGeneratedPaths();

  yield* fs.makeDirectory(generatedDir, { recursive: true });
});

const downloadFile = Effect.fn("downloadFile")(function* (url: string, outputPath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs.makeDirectory(path.dirname(outputPath), { recursive: true });

  const text = yield* HttpClient.get(url).pipe(
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.flatMap((response) => response.text)
  );

  yield* fs.writeFileString(outputPath, text);
});

const downloadSchemas = Effect.fn("downloadSchemas")(function* (tag: string) {
  const { upstreamMetaPath, upstreamSchemaPath } = yield* getGeneratedPaths();
  const fs = yield* FileSystem.FileSystem;
  const baseUrl = `https://github.com/agentclientprotocol/agent-client-protocol/releases/download/${tag}`;

  yield* downloadFile(`${baseUrl}/schema.unstable.json`, upstreamSchemaPath);
  yield* downloadFile(`${baseUrl}/meta.unstable.json`, upstreamMetaPath);

  yield* Effect.addFinalizer(() =>
    Effect.all([fs.remove(upstreamSchemaPath), fs.remove(upstreamMetaPath)]).pipe(Effect.ignoreCause({ log: true }))
  );
});

const readJsonFile = Effect.fn("readJsonFile")(function* <
  SchemaValue extends S.Top & { readonly DecodingServices: never },
>(schema: SchemaValue, filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const raw = yield* fs.readFileString(filePath);
  return yield* S.decodeEffect(S.fromJsonString(schema))(raw);
});

const writeGeneratedFiles = Effect.fn("writeGeneratedFiles")(function* (schemaOutput: string, metaOutput: string) {
  const fs = yield* FileSystem.FileSystem;
  const { metaOutputPath, schemaOutputPath } = yield* getGeneratedPaths();

  yield* fs.writeFileString(schemaOutputPath, schemaOutput);
  yield* fs.writeFileString(metaOutputPath, metaOutput);
});

function collectSchemaEntries(chunk: string): ReadonlyArray<SchemaEntry> {
  const lines = chunk
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("//"));
  const entries: Array<SchemaEntry> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const typeLine = lines[index];
    if (!typeLine?.startsWith("export type ")) {
      continue;
    }

    const constLine = lines[index + 1];
    if (!constLine?.startsWith("export const ")) {
      throw new AcpGeneratorOutputError({ message: `Malformed generator output near: ${typeLine}` });
    }

    const match = /^export type ([A-Za-z0-9_]+)/.exec(typeLine);
    if (!match?.[1]) {
      throw new AcpGeneratorOutputError({ message: `Could not extract schema name from: ${typeLine}` });
    }

    entries.push({
      name: match[1],
      code: renderSchemaEntry(match[1], constLine),
    });
    index += 1;
  }

  return entries;
}

function renderSchemaEntry(name: string, constLine: string): string {
  const schemaExpression = constLine
    .replace(new RegExp(`^export const ${name} = `), "")
    .replace(/;$/, "")
    .replaceAll("Schema.", "S.");
  return [
    "/**",
    ` * Generated ACP schema for \`${name}\`.`,
    " *",
    " * @example",
    " * ```ts",
    ` * import { ${name} } from "@beep/acp/schema"`,
    " *",
    ` * console.log(${name}.ast)`,
    " * ```",
    " *",
    " * @category schemas",
    " * @since 0.0.0",
    " */",
    `export const ${name} = ${schemaExpression}.pipe(`,
    `  $I.annoteSchema("${name}", {`,
    `    description: "Generated ACP schema for ${name}."`,
    "  })",
    ");",
    "",
    "/**",
    ` * Type for {@link ${name}}.`,
    " *",
    " * @example",
    " * ```ts",
    ` * import type { ${name} } from "@beep/acp/schema"`,
    " *",
    ` * const inspect = (value: ${name}) => value`,
    " * void inspect",
    " * ```",
    " *",
    " * @category models",
    " * @since 0.0.0",
    " */",
    `export type ${name} = typeof ${name}.Type;`,
  ].join("\n");
}

function renderMetaConst(name: string, value: string, description: string): string {
  return [
    "/**",
    ` * ${description}`,
    " *",
    " * @example",
    " * ```ts",
    ` * import { ${name} } from "@beep/acp/schema"`,
    " *",
    ` * console.log(${name})`,
    " * ```",
    " *",
    " * @category constants",
    " * @since 0.0.0",
    " */",
    `export const ${name} = ${value} as const;`,
  ].join("\n");
}

function normalizeNullableTypes(value: typeof S.Json.Type): typeof S.Json.Type {
  if (A.isArray(value)) {
    return A.map(value, normalizeNullableTypes) as typeof S.Json.Type;
  }
  if (value === null || !P.isObject(value)) {
    return value;
  }

  const normalizedObject = R.map(value as Record<string, typeof S.Json.Type>, normalizeNullableTypes);
  const typeValue = normalizedObject.type;

  if (!A.isArray(typeValue)) {
    return normalizedObject;
  }

  const normalizedTypes = A.filter(typeValue, P.isString);
  if (A.length(normalizedTypes) !== A.length(typeValue) || !A.contains(normalizedTypes, "null")) {
    return normalizedObject;
  }

  const nonNullTypes = A.filter(normalizedTypes, (entry) => entry !== "null");
  if (A.length(nonNullTypes) !== 1) {
    return normalizedObject;
  }
  const nonNullType = nonNullTypes[0]!;

  const nextObject = R.remove(normalizedObject, "type");

  return {
    anyOf: [
      {
        ...nextObject,
        type: nonNullType,
      },
      { type: "null" },
    ],
  };
}

const generateSchemas = Effect.fn("generateSchemas")(function* (skipDownload: boolean) {
  const { upstreamMetaPath, upstreamSchemaPath } = yield* getGeneratedPaths();

  yield* ensureGeneratedDir();

  if (!skipDownload) {
    yield* Effect.log(`Downloading ACP schema assets for ${CURRENT_SCHEMA_RELEASE}`);
    yield* downloadSchemas(CURRENT_SCHEMA_RELEASE);
  }

  const upstreamSchema = yield* readJsonFile(UpstreamJsonSchema, upstreamSchemaPath);
  const upstreamMeta = yield* readJsonFile(MetaJson, upstreamMetaPath);
  const normalizedDefinitions = R.map(upstreamSchema.$defs, normalizeNullableTypes);

  const sortedEntries = pipe(
    R.toEntries(normalizedDefinitions),
    A.sort(Order.mapInput(schemaNameOrder, ([name]) => name))
  );
  let generatedEntries = A.empty<SchemaEntry>();
  const generator = makeJsonSchemaGenerator();

  for (const [name, schema] of sortedEntries) {
    generator.addSchema(name, schema as never);
  }

  const output = generator.generate("openapi-3.1", normalizedDefinitions as never, false).trim();
  if (output.length > 0) {
    for (const entry of collectSchemaEntries(output)) {
      if (!A.some(generatedEntries, (existing) => existing.name === entry.name)) {
        generatedEntries = A.append(generatedEntries, entry);
      }
    }
  }

  const prelude = [
    "/**",
    " * Generated ACP protocol schema and metadata modules.",
    " *",
    " * @packageDocumentation",
    " * @since 0.0.0",
    " */",
    "",
    `// This file is generated by the @beep/acp package. Do not edit manually.`,
    `// Current ACP schema release: ${CURRENT_SCHEMA_RELEASE}`,
    "",
  ];

  const schemaOutput = [
    ...prelude,
    'import { $AcpId } from "@beep/identity";',
    'import * as S from "effect/Schema";',
    "",
    `const $I = ${GENERATED_SCHEMA_ID};`,
    "",
    pipe(
      generatedEntries,
      A.map((entry) => entry.code),
      A.join("\n\n")
    ),
    "",
  ].join("\n");

  const metaOutput = [
    ...prelude,
    'import { $AcpId } from "@beep/identity";',
    "",
    `const $I = ${GENERATED_META_ID};`,
    "void $I;",
    "",
    renderMetaConst(
      "AGENT_METHODS",
      yield* S.encodeEffect(S.fromJsonString(MetaJson.fields.agentMethods))(upstreamMeta.agentMethods),
      "Generated ACP agent method lookup table."
    ),
    "",
    renderMetaConst(
      "CLIENT_METHODS",
      yield* S.encodeEffect(S.fromJsonString(MetaJson.fields.clientMethods))(upstreamMeta.clientMethods),
      "Generated ACP client method lookup table."
    ),
    "",
    renderMetaConst(
      "PROTOCOL_VERSION",
      yield* S.encodeEffect(S.fromJsonString(MetaJson.fields.version))(upstreamMeta.version),
      "Generated ACP protocol version."
    ),
    "",
  ].join("\n");

  yield* writeGeneratedFiles(schemaOutput, metaOutput);
  yield* Effect.log(`Generated ${A.length(generatedEntries)} ACP schemas from ${CURRENT_SCHEMA_RELEASE}`);

  const { generatedDir } = yield* getGeneratedPaths();
  yield* Effect.service(ChildProcessSpawner.ChildProcessSpawner).pipe(
    Effect.flatMap((spawner) => spawner.spawn(ChildProcess.make("bunx", ["--bun", "oxfmt", generatedDir]))),
    Effect.flatMap((child) => child.exitCode),
    Effect.tap((code) =>
      code === 0
        ? Effect.void
        : Effect.fail<GenerateCommandError>({
            _tag: "GenerateCommandError",
            message: `oxfmt failed with exit code ${code}`,
          })
    )
  );
});

const generateCommand = Command.make(
  "generate",
  {
    skipDownload: Flag.boolean("skip-download").pipe(Flag.withDefault(false)),
  },
  ({ skipDownload }) => generateSchemas(skipDownload)
).pipe(Command.withDescription("Generate Effect ACP schemas from the pinned ACP release assets."));

const runtimeLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, FetchHttpClient.layer);

Command.run(generateCommand, { version: "0.0.0" }).pipe(
  Effect.scoped,
  Effect.provide(runtimeLayer),
  NodeRuntime.runMain
);
