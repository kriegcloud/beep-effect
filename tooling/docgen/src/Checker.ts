/**
 * @since 0.0.0
 */

import { codeFrameColumns } from "@babel/code-frame";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as Configuration from "./Configuration.js";
import type * as Domain from "./Domain.js";
import * as Parser from "./Parser.js";

const makeError = (
  source: Parser.SourceShape,
  position: Domain.Position,
  message: (filePath: string, frame: string) => string
) => {
  const frame = codeFrameColumns(source.sourceFile.getFullText(), { start: position });
  return [message(source.sourceFile.getFilePath(), frame)];
};

type Entry = {
  readonly doc: Domain.Doc;
  readonly position: Domain.Position;
};

function checkEntry(
  model: Entry,
  options: {
    readonly enforceVersion: boolean;
  }
) {
  return Effect.gen(function* () {
    const source = yield* Parser.Source;
    const config = yield* Configuration.Configuration;
    let errors: Array<string> = [];

    if (config.enforceDescriptions && model.doc.description === undefined) {
      errors = errors.concat(
        makeError(source, model.position, (filePath, frame) => `Missing description in file ${filePath}:\n\n${frame}`)
      );
    }

    if (config.enforceExamples && model.doc.examples.length === 0) {
      errors = errors.concat(
        makeError(source, model.position, (filePath, frame) => `Missing examples in file ${filePath}:\n\n${frame}`)
      );
    }

    if (config.enforceVersion && options.enforceVersion && model.doc.since.length === 0) {
      errors = errors.concat(
        makeError(
          source,
          model.position,
          (filePath, frame) => `Missing \`@since\` tag in file ${filePath}:\n\n${frame}`
        )
      );
    }

    return errors;
  });
}

function checkEntries(
  models: ReadonlyArray<Entry>,
  options: {
    readonly enforceVersion: boolean;
  }
) {
  return Effect.forEach(models, (model) => checkEntry(model, options)).pipe(Effect.map(A.flatten));
}

function checkFunction(model: Domain.Function) {
  return checkEntry(model, { enforceVersion: true });
}

/**
 * Checks documented functions for required docgen annotations.
 *
 * @param models - Function models to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkFunctions(models: ReadonlyArray<Domain.Function>) {
  return Effect.forEach(models, checkFunction).pipe(Effect.map(A.flatten));
}

function checkClass(model: Domain.Class) {
  return Effect.gen(function* () {
    const docErrors = yield* checkEntry(model, { enforceVersion: true });
    const staticMethodsErrors = yield* checkEntries(model.staticMethods, { enforceVersion: false });
    const methodsErrors = yield* checkEntries(model.methods, { enforceVersion: false });
    const propertiesErrors = yield* checkEntries(model.properties, { enforceVersion: false });
    return A.flatten([docErrors, staticMethodsErrors, methodsErrors, propertiesErrors]);
  });
}

/**
 * Checks documented classes and their members for required docgen annotations.
 *
 * @param models - Class models to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkClasses(models: ReadonlyArray<Domain.Class>) {
  return Effect.forEach(models, checkClass).pipe(Effect.map(A.flatten));
}

function checkConstant(model: Domain.Constant) {
  return checkEntry(model, { enforceVersion: true });
}

/**
 * Checks documented constants for required docgen annotations.
 *
 * @param models - Constant models to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkConstants(models: ReadonlyArray<Domain.Constant>) {
  return Effect.forEach(models, checkConstant).pipe(Effect.map(A.flatten));
}

function checkInterface(model: Domain.Interface) {
  return checkEntry(model, { enforceVersion: true });
}

/**
 * Checks documented interfaces for required docgen annotations.
 *
 * @param models - Interface models to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkInterfaces(models: ReadonlyArray<Domain.Interface>) {
  return Effect.forEach(models, checkInterface).pipe(Effect.map(A.flatten));
}

function checkTypeAlias(model: Domain.TypeAlias) {
  return checkEntry(model, { enforceVersion: true });
}

/**
 * Checks documented type aliases for required docgen annotations.
 *
 * @param models - Type alias models to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkTypeAliases(models: ReadonlyArray<Domain.TypeAlias>) {
  return Effect.forEach(models, checkTypeAlias).pipe(Effect.map(A.flatten));
}

function checkNamespace(
  model: Domain.Namespace
): Effect.Effect<Array<string>, never, Parser.Source | Configuration.Configuration> {
  return Effect.gen(function* () {
    const docErrors = yield* checkEntry(model, { enforceVersion: true });
    const interfacesErrors = yield* checkInterfaces(model.interfaces);
    const typeAliasesErrors = yield* checkTypeAliases(model.typeAliases);
    const namespacesErrors = yield* checkNamespaces(model.namespaces);
    return A.flatten([docErrors, interfacesErrors, typeAliasesErrors, namespacesErrors]);
  });
}

/**
 * Checks documented namespaces and their nested members for required docgen annotations.
 *
 * @param models - Namespace models to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkNamespaces(models: ReadonlyArray<Domain.Namespace>) {
  return Effect.forEach(models, checkNamespace).pipe(Effect.map(A.flatten));
}

function checkExport(model: Domain.Export) {
  return checkEntry(model, { enforceVersion: true });
}

/**
 * Checks documented manual exports for required docgen annotations.
 *
 * @param models - Export models to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkExports(models: ReadonlyArray<Domain.Export>) {
  return Effect.forEach(models, checkExport).pipe(Effect.map(A.flatten));
}

/**
 * Checks a parsed module and all of its documented members for required docgen annotations.
 *
 * @param module - Module model to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkModule(module: Domain.Module) {
  return Effect.scoped(
    Layer.build(Parser.Source.layer(module.source)).pipe(
      Effect.flatMap((context) =>
        Effect.gen(function* () {
          const functionsErrors = yield* checkFunctions(module.functions);
          const classesErrors = yield* checkClasses(module.classes);
          const constantsErrors = yield* checkConstants(module.constants);
          const interfacesErrors = yield* checkInterfaces(module.interfaces);
          const typeAliasesErrors = yield* checkTypeAliases(module.typeAliases);
          const namespacesErrors = yield* checkNamespaces(module.namespaces);
          const exportsErrors = yield* checkExports(module.exports);

          return A.flatten([
            functionsErrors,
            classesErrors,
            constantsErrors,
            interfacesErrors,
            typeAliasesErrors,
            namespacesErrors,
            exportsErrors,
          ]);
        }).pipe(Effect.provide(context))
      )
    )
  );
}

/**
 * Checks multiple parsed modules for required docgen annotations.
 *
 * @param modules - Module models to validate.
 * @returns Effect that accumulates validation error messages.
 * @category checkers
 * @since 0.0.0
 */
export function checkModules(modules: ReadonlyArray<Domain.Module>) {
  return Effect.forEach(modules, checkModule).pipe(Effect.map(A.flatten));
}
