/**
 * @since 1.0.0
 */

import * as NodePath from "@effect/platform-node/NodePath"
import * as Command from "@effect/platform/Command"
import * as CommandExecutor from "@effect/platform/CommandExecutor"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import chalk from "chalk"
import { pipe } from "effect"
import * as Array from "effect/Array"
import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import * as String from "effect/String"
import * as Glob from "glob"
import * as Configuration from "./Configuration.js"
import type * as Domain from "./Domain.js"
import { DocgenError } from "./Error.js"
import * as File from "./File.js"
import { printModule } from "./Markdown.js"
import * as Parser from "./Parser.js"
import * as Process from "./Process.js"

/**
 * Find all files matching the specified `glob` pattern, optionally excluding
 * files matching the provided `exclude` patterns.
 */
const glob = (pattern: string, exclude: ReadonlyArray<string> = []) =>
  Effect.promise(() =>
    Glob.glob(pattern, {
      ignore: exclude.slice(),
      withFileTypes: false
    })
  ).pipe(
    Effect.orDieWith(() =>
      new DocgenError({
        message: `[Core.glob] Unable to execute glob pattern '${pattern}' ` +
          `excluding files matching '${exclude}'`
      })
    )
  )

/**
 * Reads all TypeScript files in the source directory and returns an array of file objects.
 * Each file object contains the file path and its content.
 */
const readSourceFiles = Effect.gen(function*(_) {
  const config = yield* _(Configuration.Configuration)
  const fs = yield* _(FileSystem.FileSystem)
  const path = yield* _(Path.Path, Effect.provide(NodePath.layerPosix))

  const pattern = path.normalize(path.join(config.srcDir, "**", "*.ts"))
  const paths = yield* _(glob(pattern, config.exclude))
  yield* _(Effect.logInfo(chalk.bold(`${paths.length} module(s) found`)))
  return yield* _(Effect.forEach(paths, (path) =>
    Effect.map(
      fs.readFileString(path),
      (content) => File.createFile(path, content, false)
    ), { concurrency: "inherit" }))
})

/**
 * Writes a file to the `config.outDir` directory, taking into account the configuration and existing files.
 */
const writeFileToOutDir = (file: File.File) =>
  Effect.gen(function*(_) {
    const config = yield* _(Configuration.Configuration)
    const fs = yield* _(FileSystem.FileSystem)
    const path = yield* _(Path.Path)
    const process = yield* _(Process.Process)
    const cwd = yield* _(process.cwd)
    const fileName = path.relative(path.join(cwd, config.outDir), file.path)

    const exists = yield* _(fs.exists(file.path))
    if (exists) {
      if (file.isOverwriteable) {
        yield* _(Effect.logDebug(`Overwriting file ${chalk.black(fileName)}...`))
        yield* _(fs.makeDirectory(path.dirname(file.path), { recursive: true }))
        yield* _(fs.writeFileString(file.path, file.content))
      } else {
        yield* _(Effect.logDebug(
          `File ${chalk.black(fileName)} already exists, skipping creation.`
        ))
      }
    } else {
      yield* _(fs.makeDirectory(path.dirname(file.path), { recursive: true }))
      yield* _(fs.writeFileString(file.path, file.content))
    }
  })

const writeFilesToOutDir = (
  files: ReadonlyArray<File.File>
) => Effect.forEach(files, writeFileToOutDir, { discard: true })

const parseModules = (files: ReadonlyArray<File.File>) =>
  Parser.parseFiles(files).pipe(
    Effect.mapError((errors) =>
      new DocgenError({
        message: "[Core.parseModules] The following error(s) occurred while " +
          `parsing the TypeScript source files:\n${
            errors.map((errors) => errors.join("\n")).join("\n")
          }`
      })
    )
  )

/**
 * Runs the example files for the given modules, type-checking them before execution.
 */
const typeCheckAndRunExamples = (modules: ReadonlyArray<Domain.Module>) =>
  Effect.gen(function*(_) {
    const config = yield* _(Configuration.Configuration)
    if (config.runExamples) {
      yield* _(Effect.logInfo("Typechecking examples..."))
      yield* _(cleanupExamples)
      const files = yield* _(getExampleFiles(modules))
      const examples = yield* _(handleImports(files))
      const len = examples.length
      if (len > 0) {
        yield* _(Effect.logInfo(`${len} example(s) found`))
        yield* _(writeExamplesToOutDir(examples))
        yield* _(createExamplesTsConfigJson)
        yield* _(runTscOnExamples)
        yield* _(runTsxOnExamples)
      } else {
        yield* _(Effect.logInfo("No examples found."))
      }
      yield* _(cleanupExamples)
    }
  })

/**
 * Joins an array of strings with a "-" after dropping all empty strings.
 */
const filterJoin = (self: Array<string>) =>
  pipe(
    self,
    Array.filter(String.isNonEmpty),
    Array.join("-")
  )

/**
 * Extracts deeply nested namespaces with their corresponding namespace prefix
 * from a given namespace.
 */
const extractPrefixedNestedNamespaces = (
  doc: Domain.Namespace,
  prefix: string
): ReadonlyArray<[string, Domain.Namespace]> => {
  const newPrefix = String.isEmpty(prefix) ? doc.name : `${prefix}-${doc.name}`
  const namespaces = Array.flatMap(
    doc.namespaces,
    (namespace) => extractPrefixedNestedNamespaces(namespace, newPrefix)
  )
  return Array.prepend(namespaces, [prefix, doc])
}

/**
 * Generates example files for the given modules.
 */
const getExampleFiles = (modules: ReadonlyArray<Domain.Module>) =>
  Effect.gen(function*(_) {
    const config = yield* _(Configuration.Configuration)
    const path = yield* _(Path.Path)
    return Array.flatMap(modules, (module) => {
      const prefix = module.path.join("-")

      const getFiles = (exampleId: string) => (doc: Domain.NamedDoc): ReadonlyArray<File.File> =>
        Array.map(
          doc.examples,
          (content, i) =>
            File.createFile(
              path.join(
                config.outDir,
                "examples",
                `${prefix}-${exampleId}-${doc.name}-${i}.ts`
              ),
              `${content.body}\n`,
              true // make the file overwritable
            )
        )

      const allPrefixedNamespaces = Array.flatMap(module.namespaces, (namespace) =>
        extractPrefixedNestedNamespaces(namespace, ""))

      const moduleExamples = getFiles("module")(module)
      const methodsExamples = Array.flatMap(module.classes, (c) =>
        Array.flatten([
          Array.flatMap(
            c.methods,
            getFiles(`${c.name}-method`)
          ),
          Array.flatMap(
            c.staticMethods,
            getFiles(`${c.name}-staticmethod`)
          )
        ]))
      const allPrefixedInterfaces = [
        ...module.interfaces.map((iface) =>
          ["" as string, iface] as const
        ),
        ...Array.flatMap(allPrefixedNamespaces, ([prefix, namespace]) =>
          namespace.interfaces.map((iface) =>
            [filterJoin([prefix, namespace.name]), iface] as const
          ))
      ]
      const interfacesExamples = Array.flatMap(
        allPrefixedInterfaces,
        ([ns, doc]) =>
          getFiles(filterJoin(["interface", ns]))(doc)
      )
      const allPrefixedTypeAliases = [
        ...module.typeAliases.map((typeAlias) =>
          ["" as string, typeAlias] as const
        ),
        ...Array.flatMap(allPrefixedNamespaces, ([prefix, namespace]) =>
          namespace.typeAliases.map((typeAlias) =>
            [filterJoin([prefix, namespace.name]), typeAlias] as const
          ))
      ]
      const typeAliasesExamples = Array.flatMap(
        allPrefixedTypeAliases,
        ([ns, doc]) =>
          getFiles(filterJoin(["typealias", ns]))(doc)
      )
      const constantsExamples = Array.flatMap(
        module.constants,
        getFiles("constant")
      )
      const functionsExamples = Array.flatMap(
        module.functions,
        getFiles("function")
      )
      const namespacesExamples = Array.flatMap(
        allPrefixedNamespaces,
        ([ns, doc]) =>
          getFiles(filterJoin(["namespace", ns]))(doc)
      )

      return Array.flatten([
        moduleExamples,
        methodsExamples,
        interfacesExamples,
        typeAliasesExamples,
        constantsExamples,
        functionsExamples,
        namespacesExamples
      ])
    })
  })

/**
 * Adds an import statement for the `assert` module to the beginning of the given code, if it doesn't already exist.
 */
const addAssertImport = (code: string): string =>
  code.indexOf("assert.") !== -1
    ? `import * as assert from 'assert'\n${code}`
    : code

/**
 * Replaces the project name in the given source code imports with the configured project name.
 */
const replaceProjectName = (source: string) =>
  Effect.gen(function*(_) {
    const config = yield* _(Configuration.Configuration)
    const importRegex = (projectName: string) =>
      new RegExp(
        `from (?<quote>['"])${projectName}(?:/lib)?(?:/(?<path>.*))?\\k<quote>`,
        "g"
      )

    const out = source.replace(importRegex(config.projectName), (...args) => {
      const groups: { path?: string } = args[args.length - 1]
      return `from '../../src${groups.path ? `/${groups.path}` : ""}'`
    })

    return out
  })

const handleImports = (files: ReadonlyArray<File.File>) =>
  Effect.forEach(files, (file) =>
    Effect.gen(function*(_) {
      const source = yield* _(replaceProjectName(file.content))
      const content = addAssertImport(source)
      return File.createFile(file.path, content, file.isOverwriteable)
    }))

/**
 * Generates an entry point file for the given examples.
 */
const getExamplesEntryPoint = (examples: ReadonlyArray<File.File>) =>
  Effect.gen(function*(_) {
    const config = yield* _(Configuration.Configuration)
    const path = yield* _(Path.Path)
    const content = examples.map((example) => `import './${path.basename(example.path, ".ts")}'`)
      .join("\n")
    return File.createFile(
      path.normalize(path.join(config.outDir, "examples", "index.ts")),
      `${content}\n`,
      true // make the file overwritable
    )
  })

/**
 * Removes the "examples" directory from the output directory specified in the configuration.
 */
const cleanupExamples = Effect.gen(function*(_) {
  const fs = yield* _(FileSystem.FileSystem)
  const config = yield* _(Configuration.Configuration)
  const path = yield* _(Path.Path)
  const examplesDir = path.join(config.outDir, "examples")
  const exists = yield* _(Effect.orDie(fs.exists(examplesDir)))
  if (exists) {
    yield* _(fs.remove(examplesDir, { recursive: true }))
  }
})

/**
 * Runs tsc on the examples directory.
 */
const runTscOnExamples = Effect.gen(function*(_) {
  const config = yield* _(Configuration.Configuration)
  const process = yield* _(Process.Process)
  const executor = yield* _(CommandExecutor.CommandExecutor)
  const cwd = yield* _(process.cwd)
  const path = yield* _(Path.Path)
  const platform = yield* _(process.platform)

  const tsconfig = path.normalize(path.join(cwd, config.outDir, "examples", "tsconfig.json"))
  const options = ["--noEmit", "--project", tsconfig]
  const command = platform === "win32"
    ? Command.runInShell(Command.make("tsc.cmd", ...options), true)
    : Command.make("tsc", ...options)

  yield* _(Effect.logDebug("Running tsc on examples..."))

  const [stdout, exitCode] = yield* _(
    executor.start(command),
    Effect.flatMap((process) =>
      Effect.all([
        process.stdout.pipe(
          Stream.decodeText("utf-8"),
          Stream.splitLines,
          Stream.runCollect,
          Effect.map(Chunk.toReadonlyArray)
        ),
        process.exitCode
      ], { concurrency: 2 })
    )
  )

  if (exitCode !== 0) {
    yield* _(
      new DocgenError({
        message: `Something went wrong while running tsc on examples:\n\n${stdout.join("\n")}`
      })
    )
  }
})

/**
 * Runs tsc on the examples directory.
 */
const runTsxOnExamples = Effect.gen(function*(_) {
  const config = yield* _(Configuration.Configuration)
  const path = yield* _(Path.Path)
  const process = yield* _(Process.Process)
  const executor = yield* _(CommandExecutor.CommandExecutor)
  const cwd = yield* _(process.cwd)
  const platform = yield* _(process.platform)

  const examples = path.normalize(path.join(cwd, config.outDir, "examples"))
  const tsconfig = path.join(examples, "tsconfig.json")
  const index = path.join(examples, "index.ts")
  const options = ["--tsconfig", tsconfig, index]
  const command = platform === "win32"
    ? Command.runInShell(Command.make("tsx.cmd", ...options), true)
    : Command.make("tsx", ...options)

  yield* _(Effect.logDebug("Running tsx on examples..."))

  const [stdout, exitCode] = yield* _(
    executor.start(command),
    Effect.flatMap((process) =>
      Effect.all([
        process.stderr.pipe(
          Stream.decodeText("utf-8"),
          Stream.splitLines,
          Stream.runCollect,
          Effect.map(Chunk.toReadonlyArray)
        ),
        process.exitCode
      ], { concurrency: 2 })
    )
  )

  if (exitCode !== 0) {
    yield* _(
      Effect.fail(
        new DocgenError({
          message: `Something went wrong while running tsx on examples:\n\n${stdout.join("\n")}`
        })
      )
    )
  }
})

const writeExamplesToOutDir = (examples: ReadonlyArray<File.File>) =>
  Effect.gen(function*(_) {
    yield* _(Effect.logDebug("Writing examples..."))
    const entryPoint = yield* _(getExamplesEntryPoint(examples))
    const files = [entryPoint, ...examples]
    yield* _(writeFilesToOutDir(files))
  })

const createExamplesTsConfigJson = Effect.gen(function*(_) {
  yield* _(Effect.logDebug("Writing examples tsconfig..."))
  const config = yield* _(Configuration.Configuration)
  const process = yield* _(Process.Process)
  const cwd = yield* _(process.cwd)
  const path = yield* _(Path.Path)
  yield* _(writeFileToOutDir(
    File.createFile(
      path.join(cwd, config.outDir, "examples", "tsconfig.json"),
      JSON.stringify({ compilerOptions: config.examplesCompilerOptions }, null, 2),
      true // make the file overwritable
    )
  ))
})

const getMarkdown = (modules: ReadonlyArray<Domain.Module>) =>
  Effect.gen(function*(_) {
    const homepage = yield* _(getMarkdownHomepage)
    const index = yield* _(getMarkdownIndex)
    const yml = yield* _(getMarkdownConfigYML)
    const moduleFiles = yield* _(getModuleMarkdownFiles(modules))
    return [homepage, index, yml, ...moduleFiles]
  })

const getMarkdownHomepage = Effect.gen(function*(_) {
  const config = yield* _(Configuration.Configuration)
  const process = yield* _(Process.Process)
  const cwd = yield* _(process.cwd)
  const path = yield* _(Path.Path)
  return File.createFile(
    path.join(cwd, config.outDir, "index.md"),
    String.stripMargin(
      `|---
       |title: Home
       |nav_order: 1
       |---
       |`
    ),
    false
  )
})

const getMarkdownIndex = Effect.gen(function*(_) {
  const config = yield* _(Configuration.Configuration)
  const process = yield* _(Process.Process)
  const cwd = yield* _(process.cwd)
  const path = yield* _(Path.Path)
  return File.createFile(
    path.join(cwd, config.outDir, "modules", "index.md"),
    String.stripMargin(
      `|---
       |title: Modules
       |has_children: true
       |permalink: /docs/modules
       |nav_order: 2
       |---
       |`
    ),
    false
  )
})

const resolveConfigYML = (content: string) =>
  Effect.gen(function*(_) {
    const config = yield* _(Configuration.Configuration)
    return content
      .replace(/^remote_theme:.*$/m, `remote_theme: ${config.theme}`)
      .replace(
        /^search_enabled:.*$/m,
        `search_enabled: ${config.enableSearch}`
      ).replace(
        /^ {2}'\S* on GitHub':\n {4}- '.*'/m,
        `  '${config.projectName} on GitHub':\n    - '${config.projectHomepage}'`
      )
  })

const getHomepageNavigationHeader = (config: Configuration.ConfigurationShape): string => {
  const isGitHub = config.projectHomepage.toLowerCase().includes("github")
  return isGitHub ? config.projectName + " on GitHub" : "Homepage"
}

const getMarkdownConfigYML = Effect.gen(function*(_) {
  const config = yield* _(Configuration.Configuration)
  const process = yield* _(Process.Process)
  const fs = yield* _(FileSystem.FileSystem)
  const cwd = yield* _(process.cwd)
  const path = yield* _(Path.Path)
  const configPath = path.join(cwd, config.outDir, "_config.yml")
  const exists = yield* _(fs.exists(configPath))
  if (exists) {
    const content = yield* _(fs.readFileString(configPath))
    const resolved = yield* _(resolveConfigYML(content))
    return File.createFile(configPath, resolved, true)
  } else {
    return File.createFile(
      configPath,
      String.stripMargin(
        `|remote_theme: ${config.theme}
         |
         |# Enable or disable the site search
         |search_enabled: ${config.enableSearch}
         |
         |# Aux links for the upper right navigation
         |aux_links:
         |'${getHomepageNavigationHeader(config)}':
         |  - '${config.projectHomepage}'`
      ),
      false
    )
  }
})

const getModuleMarkdownOutputPath = (module: Domain.Module) =>
  Effect.map(
    Effect.all([Configuration.Configuration, Path.Path]),
    ([config, path]) =>
      path.normalize(path.join(
        config.outDir,
        "modules",
        `${module.path.slice(1).join(path.sep)}.md`
      ))
  )

const getModuleMarkdownFiles = (modules: ReadonlyArray<Domain.Module>) =>
  Effect.forEach(modules, (module, order) =>
    Effect.gen(function*(_) {
      const outputPath = yield* _(getModuleMarkdownOutputPath(module))
      const content = yield* _(printModule(module, order + 1))
      return File.createFile(outputPath, content, true)
    }))

const writeMarkdown = (files: ReadonlyArray<File.File>) =>
  Effect.gen(function*(_) {
    const config = yield* _(Configuration.Configuration)
    const path = yield* _(Path.Path, Effect.provide(NodePath.layerPosix))
    const fileSystem = yield* _(FileSystem.FileSystem)
    const pattern = path.normalize(path.join(config.outDir, "**/*.ts.md"))
    yield* _(Effect.logDebug(`Deleting ${chalk.black(pattern)}...`))
    const paths = yield* _(glob(pattern))
    yield* _(Effect.forEach(paths, (path) => fileSystem.remove(path, { recursive: true }), {
      concurrency: "unbounded"
    }))
    return yield* _(writeFilesToOutDir(files))
  })

/** @internal */
export const program = Effect.gen(function*(_) {
  yield* _(Effect.logInfo("Reading modules..."))
  const sourceFiles = yield* _(readSourceFiles)
  yield* _(Effect.logInfo("Parsing modules..."))
  const modules = yield* _(parseModules(sourceFiles))
  yield* _(typeCheckAndRunExamples(modules))
  yield* _(Effect.logInfo("Creating markdown files..."))
  const outputFiles = yield* _(getMarkdown(modules))
  yield* _(Effect.logInfo("Writing markdown files..."))
  yield* _(writeMarkdown(outputFiles))
  yield* _(Effect.logInfo(chalk.bold.green("Docs generation succeeded!")))
})
