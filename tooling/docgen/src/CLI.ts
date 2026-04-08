#!/usr/bin/env node

/**
 * @since 0.0.0
 */

import { TSConfigCompilerOptions } from "@beep/repo-utils";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import * as Configuration from "./Configuration.js";
import * as Core from "./Core.js";
import * as Domain from "./Domain.js";
import * as InternalVersion from "./internal/version.js";

const decodeCompilerOptions = S.decodeUnknownSync(S.fromJsonString(S.toEncoded(TSConfigCompilerOptions)));

const parseTsconfigFile = Flag.file("parse-tsconfig-file", { mustExist: true }).pipe(Flag.optional);
const parseCompilerOptionsText = Flag.string("parse-compiler-options").pipe(Flag.optional);
const examplesTsconfigFile = Flag.file("examples-tsconfig-file", { mustExist: true }).pipe(Flag.optional);
const examplesCompilerOptionsText = Flag.string("examples-compiler-options").pipe(Flag.optional);

const projectHomepage = Flag.string("homepage").pipe(
  Flag.withDescription("The link to the project homepage shown in the generated documentation"),
  Flag.optional
);

const srcLink = Flag.string("srcLink").pipe(Flag.withDescription("The link to the project source code"), Flag.optional);

const srcDir = Flag.directory("src").pipe(
  Flag.withDescription("The directory in which docgen will search for TypeScript files to parse"),
  Flag.optional
);

const outDir = Flag.directory("out").pipe(
  Flag.withDescription("The directory to which docgen will write markdown files"),
  Flag.optional
);

const theme = Flag.string("theme").pipe(
  Flag.withDescription("The Jekyll theme that should be used for the generated documentation"),
  Flag.optional
);

const enableSearch = Flag.boolean("enable-search").pipe(
  Flag.withDescription("Whether search should be enabled in the generated documentation"),
  Flag.optional
);

const enforceDescriptions = Flag.boolean("enforce-descriptions").pipe(
  Flag.withDescription("Whether a description for each module export should be required"),
  Flag.optional
);

const enforceExamples = Flag.boolean("enforce-examples").pipe(
  Flag.withDescription("Whether @example tags for each module export should be required"),
  Flag.optional
);

const enforceVersion = Flag.boolean("enforce-version").pipe(
  Flag.withDescription("Whether @since tags for each module export should be required"),
  Flag.optional
);

const runExamples = Flag.boolean("run-examples").pipe(
  Flag.withDescription("Whether to execute examples discovered in the source files"),
  Flag.optional
);

const exclude = Flag.string("exclude").pipe(
  Flag.withDescription("A glob pattern specifying files that should be excluded from the generated documentation"),
  Flag.optional
);

const tscExecutable = Flag.string("tscExecutable").pipe(
  Flag.withDescription("The TypeScript compiler executable to use for example type checking"),
  Flag.optional
);

const decodeCompilerOptionsText = (value: string) =>
  Effect.try({
    try: () => decodeCompilerOptions(value),
    catch: (cause) =>
      new Domain.DocgenError({
        message: `[CLI.decodeCompilerOptionsText] Invalid compiler options JSON\n${cause instanceof Error ? cause.message : String(cause)}`,
      }),
  });

const resolveCompilerOptionsInput = (filePath: O.Option<string>, text: O.Option<string>) =>
  O.isSome(filePath)
    ? Effect.succeed(O.some(filePath.value as Configuration.CompilerOptionsInput))
    : O.isSome(text)
      ? decodeCompilerOptionsText(text.value).pipe(Effect.option)
      : Effect.succeed(O.none<Configuration.CompilerOptionsInput>());

const options = {
  projectHomepage,
  srcLink,
  srcDir,
  outDir,
  theme,
  enableSearch,
  enforceDescriptions,
  enforceExamples,
  enforceVersion,
  runExamples,
  exclude,
  tscExecutable,
  parseTsconfigFile,
  parseCompilerOptionsText,
  examplesTsconfigFile,
  examplesCompilerOptionsText,
} as const;

/**
 * Builds the `docgen` CLI command and wires configuration loading to the core program.
 *
 * @internal
 * @category CLI
 * @since 0.0.0
 */
export const docgenCommand = Command.make("docgen", options, (input) =>
  Effect.gen(function* () {
    const parseCompilerOptions = yield* resolveCompilerOptionsInput(
      input.parseTsconfigFile,
      input.parseCompilerOptionsText
    );
    const examplesCompilerOptions = yield* resolveCompilerOptionsInput(
      input.examplesTsconfigFile,
      input.examplesCompilerOptionsText
    );
    const config = yield* Configuration.load({
      projectHomepage: input.projectHomepage,
      srcLink: input.srcLink,
      srcDir: input.srcDir,
      outDir: input.outDir,
      theme: input.theme,
      enableSearch: input.enableSearch,
      enforceDescriptions: input.enforceDescriptions,
      enforceExamples: input.enforceExamples,
      enforceVersion: input.enforceVersion,
      tscExecutable: input.tscExecutable,
      runExamples: input.runExamples,
      exclude: input.exclude.pipe(O.map((value) => [value] as ReadonlyArray<string>)),
      parseCompilerOptions,
      examplesCompilerOptions,
    });

    return yield* Effect.scoped(
      Layer.build(Configuration.Configuration.layer(config)).pipe(
        Effect.flatMap((context) => Core.program.pipe(Effect.provide(context)))
      )
    ).pipe(
      Effect.catchTag("DocgenError", (error) =>
        Effect.fail(
          new Domain.DocgenError({
            message: `[${config.projectName}] ${error.message}`,
          })
        )
      )
    );
  })
);

/**
 * @category CLI
 * @since 0.0.0
 */
export const cli = Command.runWith(docgenCommand, {
  version: `v${InternalVersion.moduleVersion}`,
});
