/**
 * @since 0.0.0
 */

import chalk from "@beep/chalk";
import { encodeTSConfigPrettyEffect, FsUtils } from "@beep/repo-utils";
import markdownToc from "@effect/markdown-toc";
import { Effect, FileSystem, Path, pipe, Stream } from "effect";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as ChildProcess from "effect/unstable/process/ChildProcess";
import * as Checker from "./Checker.js";
import * as Configuration from "./Configuration.js";
import * as Domain from "./Domain.js";
import * as Parser from "./Parser.js";
import * as Printer from "./Printer.js";

const globFiles = (pattern: string, exclude: ReadonlyArray<string> = []) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;
    return yield* fsUtils.globFiles(pattern, exclude.length === 0 ? undefined : { ignore: A.fromIterable(exclude) });
  }).pipe(
    Effect.mapError(
      () =>
        new Domain.DocgenError({
          message: `[Core.globFiles] Unable to execute glob pattern '${pattern}' excluding files matching '${exclude}'`,
        })
    )
  );

const readSourceFiles = Effect.gen(function* () {
  const config = yield* Configuration.Configuration;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const pattern = path.normalize(path.join(config.srcDir, "**", "*.ts"));
  const paths = yield* globFiles(pattern, config.exclude);
  yield* Effect.logInfo(chalk.bold(`${paths.length} module(s) found`));

  return yield* Effect.forEach(
    paths,
    (filePath) =>
      fs.readFileString(filePath).pipe(
        Effect.map((content) => Domain.File.new(filePath, content, false)),
        Effect.mapError(
          (cause) =>
            new Domain.DocgenError({
              message: `[Core.readSourceFiles] Failed to read '${filePath}'\n${String(cause)}`,
            })
        )
      ),
    { concurrency: "inherit" }
  );
});

const writeFileToOutDir = (file: Domain.File) =>
  Effect.gen(function* () {
    const config = yield* Configuration.Configuration;
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const process = yield* Domain.Process;
    const cwd = yield* process.cwd;
    const fileName = path.relative(path.join(cwd, config.outDir), file.path);
    const exists = yield* fs.exists(file.path).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Core.writeFileToOutDir] Failed to check '${file.path}'\n${String(cause)}`,
          })
      )
    );

    if (exists && !file.isOverwritable) {
      yield* Effect.logDebug(`File ${chalk.black(fileName)} already exists, skipping creation.`);
      return;
    }

    if (exists && file.isOverwritable) {
      yield* Effect.logDebug(`Overwriting file ${chalk.black(fileName)}...`);
    }

    yield* fs.makeDirectory(path.dirname(file.path), { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Core.writeFileToOutDir] Failed to create '${path.dirname(file.path)}'\n${String(cause)}`,
          })
      )
    );
    yield* fs.writeFileString(file.path, file.content).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Core.writeFileToOutDir] Failed to write '${file.path}'\n${String(cause)}`,
          })
      )
    );
  });

const writeFilesToOutDir = (files: ReadonlyArray<Domain.File>) =>
  Effect.forEach(files, writeFileToOutDir, { discard: true });

const parseModules = (files: ReadonlyArray<Domain.File>) =>
  Parser.parseFiles(files).pipe(
    Effect.mapError(
      (errors) =>
        new Domain.DocgenError({
          message: `[Core.parseModules] The following error(s) occurred while parsing the TypeScript source files:\n${pipe(errors, A.map(A.join("\n")), A.join("\n"))}`,
        })
    )
  );

const typeCheckAndRunExamples = (modules: ReadonlyArray<Domain.Module>) =>
  Effect.gen(function* () {
    const config = yield* Configuration.Configuration;
    yield* cleanupExamples;
    const files = yield* getExampleFiles(modules);
    const len = files.length;

    if (len > 0) {
      yield* Effect.logInfo(`${len} example(s) found`);
      yield* writeExamplesToOutDir(files);
      yield* createExamplesTsConfigJson;
      yield* Effect.logInfo("Typechecking examples...");
      yield* runTscOnExamples;
      if (config.runExamples) {
        yield* Effect.logInfo("Running examples...");
        yield* runBunOnExamples;
      } else {
        yield* Effect.logInfo(chalk.gray("Skipping running examples"));
      }
    } else {
      yield* Effect.logInfo("No examples found.");
    }

    yield* cleanupExamples;
  });

const filterJoin = (segments: ReadonlyArray<string>) => pipe(segments, A.filter(Str.isNonEmpty), A.join("-"));

const extractPrefixedNestedNamespaces = (
  doc: Domain.Namespace,
  prefix: string
): ReadonlyArray<readonly [string, Domain.Namespace]> => {
  const newPrefix = Str.isEmpty(prefix) ? doc.name : `${prefix}-${doc.name}`;
  const namespaces = A.flatMap(doc.namespaces, (namespace) => extractPrefixedNestedNamespaces(namespace, newPrefix));
  return A.prepend(namespaces, [prefix, doc] as const);
};

/**
 * The metadata key for skipping type-checking.
 *
 * @since 0.0.0
 */
export const SKIP_TYPE_CHECKING_FENCE_METADATA = "skip-type-checking";

/**
 * Extracts all fenced code blocks from markdown content.
 * Handles both ``` and ~~~ fences, including any metadata.
 *
 * @internal
 */
export const extractFencedCode = (content: string): [examples: Array<string>, warnings: Array<string>] => {
  const fenceRegex = /(?:```|~~~)(.*?)\n([\s\S]*?)(?:(```|~~~)|$)/g;
  const matches = pipe(content, Str.matchAll(fenceRegex), A.fromIterable);
  const warnings = pipe(
    matches,
    A.filter((match) => match[3] === undefined),
    A.map(() => `Code block does not have a matching closing fence:\n${content}`)
  );

  const examples = pipe(
    matches,
    A.filter((match) => {
      const metadata = Str.toLowerCase(match[1] ?? "");
      const isTypeScript = pipe(
        ["ts", "typescript"],
        A.some((prefix) => Str.startsWith(prefix)(metadata))
      );
      const isSkipTypeChecking = Str.includes(SKIP_TYPE_CHECKING_FENCE_METADATA)(metadata);
      return isTypeScript && !isSkipTypeChecking;
    }),
    A.map((match) => Str.trim(match[2] ?? ""))
  );

  return [examples, warnings];
};

const getExampleFiles = (modules: ReadonlyArray<Domain.Module>) =>
  Effect.gen(function* () {
    const config = yield* Configuration.Configuration;
    const path = yield* Path.Path;
    let warnings: Array<string> = [];

    const files = A.flatMap(modules, (module) => {
      const prefix = A.join("-")(module.path);

      const getFiles =
        (exampleId: string) =>
        (namedDoc: { readonly name: string; readonly doc: Domain.Doc }): ReadonlyArray<Domain.File> => {
          let descriptionExamples: ReadonlyArray<string> = [];
          if (namedDoc.doc.description !== undefined) {
            const [examples, nextWarnings] = extractFencedCode(namedDoc.doc.description);
            warnings = A.appendAll(warnings, nextWarnings);
            descriptionExamples = examples;
          }

          let exampleTagExamples: ReadonlyArray<string> = [];
          for (const example of namedDoc.doc.examples) {
            const [examples, nextWarnings] = extractFencedCode(example);
            warnings = A.appendAll(warnings, nextWarnings);
            exampleTagExamples = A.appendAll(exampleTagExamples, examples);
          }

          return pipe(
            descriptionExamples,
            A.appendAll(exampleTagExamples),
            A.map((example, index) =>
              Domain.File.new(
                path.join(config.outDir, "examples", `${prefix}-${exampleId}-${namedDoc.name}-${index}.ts`),
                example,
                true
              )
            )
          );
        };

      const allPrefixedNamespaces = A.flatMap(module.namespaces, (namespace) =>
        extractPrefixedNestedNamespaces(namespace, "")
      );

      const moduleExamples = getFiles("module")(module);
      const classExamples = A.flatMap(module.classes, (c) =>
        A.flatten([
          getFiles("class")(c),
          A.flatMap(c.methods, getFiles(`${c.name}-method`)),
          A.flatMap(c.staticMethods, getFiles(`${c.name}-staticmethod`)),
        ])
      );
      const allPrefixedInterfaces = A.appendAll(
        A.map(module.interfaces, (iface) => ["" as string, iface] as const),
        A.flatMap(allPrefixedNamespaces, ([prefixValue, namespace]) =>
          A.map(namespace.interfaces, (iface) => [filterJoin([prefixValue, namespace.name]), iface] as const)
        )
      );
      const interfacesExamples = A.flatMap(allPrefixedInterfaces, ([namespaceValue, doc]) =>
        getFiles(filterJoin(["interface", namespaceValue]))(doc)
      );
      const allPrefixedTypeAliases = A.appendAll(
        A.map(module.typeAliases, (typeAlias) => ["" as string, typeAlias] as const),
        A.flatMap(allPrefixedNamespaces, ([prefixValue, namespace]) =>
          A.map(namespace.typeAliases, (typeAlias) => [filterJoin([prefixValue, namespace.name]), typeAlias] as const)
        )
      );
      const typeAliasesExamples = A.flatMap(allPrefixedTypeAliases, ([namespaceValue, doc]) =>
        getFiles(filterJoin(["typealias", namespaceValue]))(doc)
      );
      const constantsExamples = A.flatMap(module.constants, getFiles("constant"));
      const functionsExamples = A.flatMap(module.functions, getFiles("function"));
      const exportsExamples = A.flatMap(module.exports, getFiles("export"));
      const namespacesExamples = A.flatMap(allPrefixedNamespaces, ([namespaceValue, doc]) =>
        getFiles(filterJoin(["namespace", namespaceValue]))(doc)
      );

      return A.flatten([
        moduleExamples,
        classExamples,
        interfacesExamples,
        typeAliasesExamples,
        constantsExamples,
        functionsExamples,
        namespacesExamples,
        exportsExamples,
      ]);
    });

    if (warnings.length > 0) {
      yield* Effect.logWarning(A.join("\n")(warnings));
    }

    return files;
  });

const getExamplesEntryPoint = (examples: ReadonlyArray<Domain.File>) =>
  Effect.gen(function* () {
    const config = yield* Configuration.Configuration;
    const path = yield* Path.Path;
    const content = pipe(
      examples,
      A.map((example) => `import "./${path.basename(example.path, ".ts")}"`),
      A.join("\n")
    );
    return Domain.File.new(path.normalize(path.join(config.outDir, "examples", "index.ts")), `${content}\n`, true);
  });

const cleanupExamples = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const config = yield* Configuration.Configuration;
  const path = yield* Path.Path;
  const examplesDir = path.join(config.outDir, "examples");
  const exists = yield* fs.exists(examplesDir).pipe(Effect.orElseSucceed(() => false));
  if (exists) {
    yield* fs.remove(examplesDir, { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Core.cleanupExamples] Failed to remove '${examplesDir}'\n${String(cause)}`,
          })
      )
    );
  }
});

const collectCommandOutput = (command: ChildProcess.Command) =>
  Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* command;
      const output = yield* handle.all.pipe(
        Stream.decodeText(),
        Stream.runFold(
          () => "",
          (acc: string, chunk) => `${acc}${chunk}`
        )
      );
      const exitCode = yield* handle.exitCode;
      return {
        output: Str.trim(output),
        exitCode,
      };
    })
  );

const runTscOnExamples = Effect.gen(function* () {
  const config = yield* Configuration.Configuration;
  const process = yield* Domain.Process;
  const cwd = yield* process.cwd;
  const path = yield* Path.Path;
  const tsconfig = path.normalize(path.join(cwd, config.outDir, "examples", "tsconfig.json"));
  const command = ChildProcess.make(config.tscExecutable, ["--noEmit", "--project", tsconfig], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });

  yield* Effect.logDebug("Running tsc on examples...");
  const { output, exitCode } = yield* collectCommandOutput(command).pipe(
    Effect.mapError(
      (cause) =>
        new Domain.DocgenError({
          message: `[Core.runTscOnExamples] Failed to run '${config.tscExecutable}'\n${String(cause)}`,
        })
    )
  );

  if (exitCode !== 0) {
    return yield* new Domain.DocgenError({
      message: `Something went wrong while running tsc on examples:\n\n${output}`,
    });
  }
});

const runBunOnExamples = Effect.gen(function* () {
  const config = yield* Configuration.Configuration;
  const process = yield* Domain.Process;
  const cwd = yield* process.cwd;
  const path = yield* Path.Path;
  const examplesDir = path.normalize(path.join(cwd, config.outDir, "examples"));
  const index = path.join(examplesDir, "index.ts");
  const command = ChildProcess.make("bun", [index], {
    cwd: examplesDir,
    stdout: "pipe",
    stderr: "pipe",
  });

  yield* Effect.logDebug("Running bun on examples...");
  const { output, exitCode } = yield* collectCommandOutput(command).pipe(
    Effect.mapError(
      (cause) =>
        new Domain.DocgenError({
          message: `[Core.runBunOnExamples] Failed to run bun examples\n${String(cause)}`,
        })
    )
  );

  if (exitCode !== 0) {
    return yield* new Domain.DocgenError({
      message: `Something went wrong while running example files:\n\n${output}`,
    });
  }
});

const writeExamplesToOutDir = (examples: ReadonlyArray<Domain.File>) =>
  Effect.gen(function* () {
    yield* Effect.logDebug("Writing examples...");
    const entryPoint = yield* getExamplesEntryPoint(examples);
    yield* writeFilesToOutDir([entryPoint, ...examples]);
  });

const createExamplesTsConfigJson = Effect.gen(function* () {
  yield* Effect.logDebug("Writing examples tsconfig...");
  const config = yield* Configuration.Configuration;
  const process = yield* Domain.Process;
  const cwd = yield* process.cwd;
  const path = yield* Path.Path;
  const content = yield* encodeTSConfigPrettyEffect({
    compilerOptions: config.examplesCompilerOptions,
  }).pipe(
    Effect.mapError(
      (cause) =>
        new Domain.DocgenError({
          message: `[Core.createExamplesTsConfigJson] Failed to encode examples tsconfig\n${String(cause)}`,
        })
    )
  );
  yield* writeFileToOutDir(Domain.File.new(path.join(cwd, config.outDir, "examples", "tsconfig.json"), content, true));
});

const getMarkdown = (modules: ReadonlyArray<Domain.Module>) =>
  Effect.gen(function* () {
    const homepage = yield* getMarkdownHomepage;
    const index = yield* getMarkdownIndex;
    const yml = yield* getMarkdownConfigYML;
    const moduleFiles = yield* getModuleMarkdownFiles(modules);
    return [homepage, index, yml, ...moduleFiles];
  });

const getMarkdownHomepage = Effect.gen(function* () {
  const config = yield* Configuration.Configuration;
  const process = yield* Domain.Process;
  const cwd = yield* process.cwd;
  const path = yield* Path.Path;
  return Domain.File.new(
    path.join(cwd, config.outDir, "index.md"),
    Str.stripMargin(`|---
       |title: Home
       |nav_order: 1
       |---
       |`),
    false
  );
});

const getMarkdownIndex = Effect.gen(function* () {
  const config = yield* Configuration.Configuration;
  const process = yield* Domain.Process;
  const cwd = yield* process.cwd;
  const path = yield* Path.Path;
  return Domain.File.new(
    path.join(cwd, config.outDir, "modules", "index.md"),
    Str.stripMargin(`|---
       |title: Modules
       |has_children: true
       |permalink: /docs/modules
       |nav_order: 2
       |---
       |`),
    false
  );
});

const resolveConfigYML = (content: string) =>
  Effect.gen(function* () {
    const config = yield* Configuration.Configuration;
    return pipe(
      content,
      Str.replace(/^remote_theme:.*$/m, `remote_theme: ${config.theme}`),
      Str.replace(/^search_enabled:.*$/m, `search_enabled: ${config.enableSearch}`),
      Str.replace(
        /^ {2}'\S* on GitHub':\n {4}- '.*'/m,
        `  '${config.projectName} on GitHub':\n    - '${config.projectHomepage}'`
      )
    );
  });

const getHomepageNavigationHeader = (config: Configuration.ConfigurationShape): string =>
  pipe(config.projectHomepage, Str.toLowerCase, Str.includes("github"))
    ? `${config.projectName} on GitHub`
    : "Homepage";

const getMarkdownConfigYML = Effect.gen(function* () {
  const config = yield* Configuration.Configuration;
  const process = yield* Domain.Process;
  const fs = yield* FileSystem.FileSystem;
  const cwd = yield* process.cwd;
  const path = yield* Path.Path;
  const configPath = path.join(cwd, config.outDir, "_config.yml");
  const exists = yield* fs.exists(configPath).pipe(Effect.orElseSucceed(() => false));

  if (exists) {
    const content = yield* fs.readFileString(configPath).pipe(
      Effect.mapError(
        (cause) =>
          new Domain.DocgenError({
            message: `[Core.getMarkdownConfigYML] Failed to read '${configPath}'\n${String(cause)}`,
          })
      )
    );
    const resolved = yield* resolveConfigYML(content);
    return Domain.File.new(configPath, resolved, true);
  }

  return Domain.File.new(
    configPath,
    Str.stripMargin(`|remote_theme: ${config.theme}
         |
         |# Enable or disable the site search
         |search_enabled: ${config.enableSearch}
         |
         |# Aux links for the upper right navigation
         |aux_links:
         |'${getHomepageNavigationHeader(config)}':
         |  - '${config.projectHomepage}'`),
    false
  );
});

const getModuleMarkdownOutputPath = (module: Domain.Module) =>
  Effect.gen(function* () {
    const config = yield* Configuration.Configuration;
    const path = yield* Path.Path;
    const modulePath = pipe(module.path, A.drop(1), A.join(path.sep));
    return path.normalize(path.join(config.outDir, "modules", `${modulePath}.md`));
  });

const getModuleMarkdownFiles = (modules: ReadonlyArray<Domain.Module>) =>
  Effect.forEach(modules, (module, index) =>
    Effect.gen(function* () {
      const outputPath = yield* getModuleMarkdownOutputPath(module);
      const moduleContent = yield* Printer.printModule(module);
      const toc = markdownToc(moduleContent, { bullets: "-" }).content;
      const frontMatter = Printer.printFrontMatter(module, index + 1);
      const content = pipe(
        `${frontMatter}\n\n${moduleContent}`,
        Str.replace(
          "<!-- toc -->",
          `---
## Exports Grouped by Category
${toc}
---`
        )
      );
      const prettified = yield* Printer.prettify(content);
      return Domain.File.new(outputPath, prettified, true);
    })
  );

const writeMarkdown = (files: ReadonlyArray<Domain.File>) =>
  Effect.gen(function* () {
    const config = yield* Configuration.Configuration;
    const path = yield* Path.Path;
    const fileSystem = yield* FileSystem.FileSystem;
    const pattern = path.normalize(path.join(config.outDir, "**/*.ts.md"));
    yield* Effect.logDebug(`Deleting ${chalk.black(pattern)}...`);
    const paths = yield* globFiles(pattern);
    yield* Effect.forEach(
      paths,
      (filePath) =>
        fileSystem.remove(filePath, { recursive: true }).pipe(
          Effect.mapError(
            (cause) =>
              new Domain.DocgenError({
                message: `[Core.writeMarkdown] Failed to delete '${filePath}'\n${String(cause)}`,
              })
          )
        ),
      {
        concurrency: "unbounded",
        discard: true,
      }
    );
    return yield* writeFilesToOutDir(files);
  });

/**
 * @internal
 */
export const program = Effect.gen(function* () {
  yield* Effect.logInfo("Reading modules...");
  const sourceFiles = yield* readSourceFiles;
  yield* Effect.logInfo("Parsing modules...");
  const modules = yield* parseModules(sourceFiles);

  yield* Effect.all(
    [
      Effect.gen(function* () {
        yield* Effect.logInfo("Checking modules...");
        const errors = yield* Checker.checkModules(modules);
        if (errors.length > 0) {
          return yield* new Domain.DocgenError({
            message: `The following errors occurred while checking the modules:\n\n${A.join("\n\n")(errors)}`,
          });
        }
        yield* typeCheckAndRunExamples(modules);
      }),
      Effect.gen(function* () {
        yield* Effect.logInfo("Creating markdown files...");
        const outputFiles = yield* getMarkdown(modules);
        yield* Effect.logInfo("Writing markdown files...");
        yield* writeMarkdown(outputFiles);
      }),
    ],
    { concurrency: "unbounded", discard: true }
  );
  yield* Effect.logInfo(chalk.bold.green("✓ Docs generation succeeded!"));
});
