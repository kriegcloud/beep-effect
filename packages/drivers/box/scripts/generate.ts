#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { Match } from "effect";
import ts from "typescript";

type GeneratedDeclaration = {
  readonly baseName?: string;
  readonly fields?: readonly GeneratedField[];
  readonly kind: "class" | "interface" | "type";
  readonly name: string;
  readonly schemaExpression?: string;
};

type GeneratedField = {
  readonly name: string;
  readonly optional: boolean;
  readonly schemaExpression: string;
};

type ManagerProperty = {
  readonly className: string;
  readonly managerName: string;
};

type ManagerMethod = {
  readonly className: string;
  readonly fileName: string;
  readonly fullMethodName: string;
  readonly managerName: string;
  readonly methodName: string;
  readonly parameters: readonly MethodParameter[];
  readonly payloadName: string;
  readonly returnType: string;
  readonly successName: string;
  readonly successSchemaExpression: string;
};

type MethodParameter = {
  readonly name: string;
  readonly optional: boolean;
  readonly schemaExpression: string;
  readonly typeText: string;
};

type GenerationState = {
  readonly constrainedTypes: Set<string>;
  readonly declarationNames: Set<string>;
  readonly nonJsonDeclarationNames: Set<string>;
};

const repoRoot = path.resolve(import.meta.dirname, "../../../..");
const packageRoot = path.resolve(import.meta.dirname, "..");
const sdkRoot = path.resolve(repoRoot, "node_modules/box-node-sdk");
const generatedRoot = path.resolve(packageRoot, "src/_generated");
const modelsOutputPath = path.resolve(generatedRoot, "Box.models.gen.ts");
const operationsOutputPath = path.resolve(generatedRoot, "Box.operations.gen.ts");

const schemaDirectories = [path.resolve(sdkRoot, "lib/schemas"), path.resolve(sdkRoot, "lib/managers")];
const clientPath = path.resolve(sdkRoot, "lib/client.d.ts");

const BYTE_OR_EVENT_PATTERN = /\b(?:ByteStream|EventStream)\b/;

const readFile = (filePath: string): string => fs.readFileSync(filePath, "utf8");

const writeFile = (filePath: string, content: string): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${content.trimEnd()}\n`);
};

const findFiles = (directory: string): readonly string[] =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.resolve(directory, entry.name);
      if (entry.isDirectory()) {
        return [...findFiles(entryPath)];
      }
      return entry.name.endsWith(".d.ts") ? [entryPath] : [];
    })
    .sort((left, right) => left.localeCompare(right));

const sourceFileFor = (filePath: string): ts.SourceFile =>
  ts.createSourceFile(filePath, readFile(filePath), ts.ScriptTarget.Latest, true);

const hasExportModifier = (node: ts.Node): boolean =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

const lowerFirst = (value: string): string =>
  value.length === 0 ? value : `${value[0]?.toLowerCase()}${value.slice(1)}`;

const upperFirst = (value: string): string =>
  value.length === 0 ? value : `${value[0]?.toUpperCase()}${value.slice(1)}`;

const toIdentifier = (value: string): string =>
  value
    .replace(/[^A-Za-z0-9_$]+/g, " ")
    .split(" ")
    .filter((part) => part.length > 0)
    .map(upperFirst)
    .join("");

const stringLiteral = (value: string): string => JSON.stringify(value);

const literalExpression = (value: string | number | boolean): string => JSON.stringify(value);

const schemaArray = (items: readonly string[]): string => `[${items.join(", ")}]`;

const finalTopLevelPipeOpenIndex = (expression: string): number | undefined => {
  let depth = 0;
  let pipeOpenIndex: number | undefined;
  let quoted: '"' | "'" | "`" | undefined;
  let escaped = false;

  for (let index = 0; index < expression.length; index += 1) {
    const character = expression[index];

    if (character === undefined) {
      continue;
    }

    if (quoted !== undefined) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\") {
        escaped = true;
        continue;
      }
      if (character === quoted) {
        quoted = undefined;
      }
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quoted = character;
      continue;
    }

    if (depth === 0 && expression.startsWith(".pipe(", index)) {
      pipeOpenIndex = index + ".pipe(".length;
      continue;
    }

    if (character === "(" || character === "[" || character === "{") {
      depth += 1;
      continue;
    }

    if (character === ")" || character === "]" || character === "}") {
      depth -= 1;
    }
  }

  return depth === 0 && pipeOpenIndex !== undefined && expression.endsWith(")") ? pipeOpenIndex : undefined;
};

const pipeExpression = (expression: string, operation: string): string => {
  const pipeOpenIndex = finalTopLevelPipeOpenIndex(expression);

  return pipeOpenIndex === undefined ? `${expression}.pipe(${operation})` : `${expression.slice(0, -1)}, ${operation})`;
};

const optionalExpression = (expression: string): string => pipeExpression(expression, "S.optionalKey");

const shouldSkipDeclaration = (name: string): boolean =>
  name.endsWith("Manager") ||
  name.endsWith("ManagerInput") ||
  name === "Authentication" ||
  name === "NetworkSession" ||
  name === "FetchResponse";

const fieldSchema = (field: GeneratedField): string =>
  field.optional ? optionalExpression(field.schemaExpression) : field.schemaExpression;

const renderField = (field: GeneratedField): string => `${field.name}: ${fieldSchema(field)},`;

const renderStructFields = (fields: string): string => (fields.length === 0 ? "" : `\n    ${fields}\n  `);

const isIdentifierName = (value: string): boolean => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);

const propertyName = (name: string): string => (isIdentifierName(name) ? name : stringLiteral(name));

const extractPropertyName = (name: ts.PropertyName, sourceFile: ts.SourceFile): string | undefined => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return undefined;
};

const typeNameText = (node: ts.EntityName): string =>
  ts.isIdentifier(node) ? node.text : `${typeNameText(node.left)}.${node.right.text}`;

const literalValue = (node: ts.LiteralTypeNode): string | number | boolean | null | undefined => {
  const literal = node.literal;
  if (ts.isStringLiteral(literal) || ts.isNumericLiteral(literal)) {
    return ts.isNumericLiteral(literal) ? Number(literal.text) : literal.text;
  }
  if (literal.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (literal.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  if (literal.kind === ts.SyntaxKind.NullKeyword) {
    return null;
  }
  return undefined;
};

const schemaForLiteral = (value: string | number | boolean | null | undefined): string => {
  if (value === null) {
    return "S.Null";
  }
  if (value === undefined) {
    return "S.Undefined";
  }
  return `S.Literal(${literalExpression(value)})`;
};

const schemaForReference = (name: string, state: GenerationState): string =>
  Match.value(name).pipe(
    Match.whenOr("string", "String", () => "S.String"),
    Match.whenOr("number", "Number", () => "S.Finite"),
    Match.whenOr("boolean", "Boolean", () => "S.Boolean"),
    Match.whenOr("unknown", "any", "object", "Object", () => {
      state.constrainedTypes.add(name);
      return "S.Unknown";
    }),
    Match.when("DateTime", () => "BoxSdkDateTime"),
    Match.when("Date", () => "BoxSdkDate"),
    Match.when("SerializedData", () => "BoxSerializedData"),
    Match.when("CancellationToken", () => "S.instanceOf(AbortSignal)"),
    Match.whenOr(
      "ByteStream",
      "Buffer",
      "FormData",
      "AgentOptions",
      "Agent",
      "Interceptor",
      "TokenStorage",
      "PrivateKeyDecryptor",
      "RequestInit",
      () => {
        state.constrainedTypes.add(name);
        return "S.Unknown";
      }
    ),
    Match.orElse(() => (state.declarationNames.has(name) ? `S.suspend(() => ${name})` : "S.Unknown"))
  );

const schemaForTypeLiteral = (node: ts.TypeLiteralNode, state: GenerationState): string => {
  const fields: string[] = [];
  const indexSignatures: string[] = [];

  for (const member of node.members) {
    if (ts.isPropertySignature(member) && member.type !== undefined) {
      const name = extractPropertyName(member.name, node.getSourceFile());
      if (name === undefined || name === "rawData") {
        continue;
      }
      const schema = schemaForType(member.type, state);
      fields.push(
        `${propertyName(name)}: ${member.questionToken === undefined ? schema : optionalExpression(schema)},`
      );
    }
    if (ts.isIndexSignatureDeclaration(member) && member.type !== undefined) {
      indexSignatures.push(`S.Record(S.String, ${schemaForType(member.type, state)})`);
    }
  }

  if (fields.length === 0 && indexSignatures.length > 0) {
    return indexSignatures[0] ?? "S.Record(S.String, S.Unknown)";
  }

  if (fields.length === 0) {
    return "S.Record(S.String, S.Unknown)";
  }

  return `S.Struct({ ${fields.join(" ")} })`;
};

const schemaForUnion = (node: ts.UnionTypeNode, state: GenerationState): string => {
  const literalValues: Array<string | number | boolean> = [];
  const otherSchemas: string[] = [];
  let hasStringKeyword = false;
  let hasNumberKeyword = false;
  let hasBooleanKeyword = false;
  let hasNull = false;
  let hasUndefined = false;

  for (const type of node.types) {
    if (type.kind === ts.SyntaxKind.StringKeyword) {
      hasStringKeyword = true;
      continue;
    }
    if (type.kind === ts.SyntaxKind.NumberKeyword) {
      hasNumberKeyword = true;
      continue;
    }
    if (type.kind === ts.SyntaxKind.BooleanKeyword) {
      hasBooleanKeyword = true;
      continue;
    }
    if (type.kind === ts.SyntaxKind.NullKeyword) {
      hasNull = true;
      continue;
    }
    if (type.kind === ts.SyntaxKind.UndefinedKeyword) {
      hasUndefined = true;
      continue;
    }
    if (ts.isLiteralTypeNode(type)) {
      const value = literalValue(type);
      if (value === null) {
        hasNull = true;
        continue;
      }
      if (value === undefined) {
        hasUndefined = true;
        continue;
      }
      literalValues.push(value);
      continue;
    }
    otherSchemas.push(schemaForType(type, state));
  }

  if (hasStringKeyword) {
    otherSchemas.push("S.String");
  }
  if (hasNumberKeyword) {
    otherSchemas.push("S.Finite");
  }
  if (hasBooleanKeyword) {
    otherSchemas.push("S.Boolean");
  }

  const literalSchema =
    literalValues.length === 0 ? undefined : `LiteralKit([${literalValues.map(literalExpression).join(", ")}])`;
  const baseSchemas = literalSchema === undefined ? otherSchemas : [literalSchema, ...otherSchemas];
  const uniqueSchemas = [...new Set(baseSchemas)];
  const base =
    uniqueSchemas.length === 0
      ? "S.Unknown"
      : uniqueSchemas.length === 1
        ? (uniqueSchemas[0] ?? "S.Unknown")
        : `S.Union(${schemaArray(uniqueSchemas)})`;
  const nullable = hasNull ? pipeExpression(base, "S.NullOr") : base;
  return hasUndefined ? pipeExpression(nullable, "S.UndefinedOr") : nullable;
};

const schemaForType = (node: ts.TypeNode, state: GenerationState): string => {
  if (ts.isParenthesizedTypeNode(node)) {
    return schemaForType(node.type, state);
  }
  if (ts.isArrayTypeNode(node)) {
    return pipeExpression(schemaForType(node.elementType, state), "S.Array");
  }
  if (ts.isTypeOperatorNode(node)) {
    return schemaForType(node.type, state);
  }
  if (ts.isUnionTypeNode(node)) {
    return schemaForUnion(node, state);
  }
  if (ts.isIntersectionTypeNode(node)) {
    state.constrainedTypes.add(node.getText());
    return "S.Unknown";
  }
  if (ts.isLiteralTypeNode(node)) {
    return schemaForLiteral(literalValue(node));
  }
  if (ts.isTypeLiteralNode(node)) {
    return schemaForTypeLiteral(node, state);
  }
  if (ts.isTypeReferenceNode(node)) {
    const name = typeNameText(node.typeName);
    const typeArguments = node.typeArguments ?? [];
    if (name === "Array" || name === "ReadonlyArray") {
      return pipeExpression(schemaForType(typeArguments[0] ?? node, state), "S.Array");
    }
    if (name === "Record") {
      return `S.Record(S.String, ${schemaForType(typeArguments[1] ?? node, state)})`;
    }
    if (name === "Promise") {
      return schemaForType(typeArguments[0] ?? node, state);
    }
    return schemaForReference(name, state);
  }

  return Match.value(node.kind).pipe(
    Match.when(ts.SyntaxKind.StringKeyword, () => "S.String"),
    Match.when(ts.SyntaxKind.NumberKeyword, () => "S.Finite"),
    Match.when(ts.SyntaxKind.BooleanKeyword, () => "S.Boolean"),
    Match.whenOr(ts.SyntaxKind.UnknownKeyword, ts.SyntaxKind.AnyKeyword, ts.SyntaxKind.ObjectKeyword, () => {
      state.constrainedTypes.add(node.getText());
      return "S.Unknown";
    }),
    Match.when(ts.SyntaxKind.UndefinedKeyword, () => "S.Undefined"),
    Match.when(ts.SyntaxKind.NullKeyword, () => "S.Null"),
    Match.orElse(() => {
      state.constrainedTypes.add(node.getText());
      return "S.Unknown";
    })
  );
};

const collectFields = (
  members: ts.NodeArray<ts.ClassElement | ts.TypeElement>,
  state: GenerationState
): readonly GeneratedField[] => {
  const fields: GeneratedField[] = [];

  for (const member of members) {
    if ((ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) && member.type !== undefined) {
      const name = extractPropertyName(member.name, member.getSourceFile());
      if (name === undefined || name === "rawData") {
        continue;
      }
      fields.push({
        name: propertyName(name),
        optional: member.questionToken !== undefined,
        schemaExpression: schemaForType(member.type, state),
      });
    }
    if (ts.isIndexSignatureDeclaration(member) && member.type !== undefined) {
      fields.push({
        name: "[key: string]",
        optional: false,
        schemaExpression: schemaForType(member.type, state),
      });
    }
  }

  return fields.filter((field) => field.name !== "[key: string]");
};

const declarationName = (statement: ts.Statement): string | undefined => {
  if (
    (ts.isInterfaceDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)) &&
    statement.name !== undefined
  ) {
    return statement.name.text;
  }
  return undefined;
};

const collectDeclarationNames = (files: readonly string[]): Set<string> => {
  const names = new Set<string>();

  for (const file of files) {
    const sourceFile = sourceFileFor(file);
    for (const statement of sourceFile.statements) {
      const name = declarationName(statement);
      if (name !== undefined && hasExportModifier(statement) && !shouldSkipDeclaration(name)) {
        names.add(name);
      }
    }
  }

  return names;
};

const collectNonJsonDeclarationNames = (files: readonly string[]): Set<string> => {
  const names = new Set<string>();

  for (const file of files) {
    const sourceFile = sourceFileFor(file);
    for (const statement of sourceFile.statements) {
      const name = declarationName(statement);
      if (
        name !== undefined &&
        hasExportModifier(statement) &&
        BYTE_OR_EVENT_PATTERN.test(statement.getText(sourceFile))
      ) {
        names.add(name);
      }
    }
  }

  return names;
};

const typeReferencesNonJson = (node: ts.TypeNode, state: GenerationState): boolean => {
  if (BYTE_OR_EVENT_PATTERN.test(node.getText())) {
    return true;
  }
  if (ts.isParenthesizedTypeNode(node)) {
    return typeReferencesNonJson(node.type, state);
  }
  if (ts.isArrayTypeNode(node)) {
    return typeReferencesNonJson(node.elementType, state);
  }
  if (ts.isTypeOperatorNode(node)) {
    return typeReferencesNonJson(node.type, state);
  }
  if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
    return node.types.some((type) => typeReferencesNonJson(type, state));
  }
  if (ts.isTypeLiteralNode(node)) {
    return node.members.some((member) => {
      if ((ts.isPropertySignature(member) || ts.isIndexSignatureDeclaration(member)) && member.type !== undefined) {
        return typeReferencesNonJson(member.type, state);
      }
      return false;
    });
  }
  if (ts.isTypeReferenceNode(node)) {
    const name = typeNameText(node.typeName);
    return (
      state.nonJsonDeclarationNames.has(name) ||
      (node.typeArguments ?? []).some((typeArgument) => typeReferencesNonJson(typeArgument, state))
    );
  }

  return false;
};

const declarationFromStatement = (
  statement: ts.Statement,
  state: GenerationState
): GeneratedDeclaration | undefined => {
  const name = declarationName(statement);
  if (name === undefined || !hasExportModifier(statement) || shouldSkipDeclaration(name)) {
    return undefined;
  }

  if (ts.isInterfaceDeclaration(statement)) {
    return {
      fields: collectFields(statement.members, state),
      kind: "interface",
      name,
    };
  }

  if (ts.isClassDeclaration(statement)) {
    const baseName = statement.heritageClauses
      ?.flatMap((clause) => clause.types)
      .map((heritage) => heritage.expression.getText(statement.getSourceFile()))
      .find((candidate) => state.declarationNames.has(candidate));

    return {
      baseName,
      fields: collectFields(statement.members, state),
      kind: "class",
      name,
    };
  }

  if (ts.isTypeAliasDeclaration(statement)) {
    return {
      kind: "type",
      name,
      schemaExpression: schemaForType(statement.type, state),
    };
  }

  return undefined;
};

const sortDeclarations = (declarations: readonly GeneratedDeclaration[]): readonly GeneratedDeclaration[] => {
  const declarationsByName = new Map(declarations.map((declaration) => [declaration.name, declaration]));
  const sorted: GeneratedDeclaration[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (declaration: GeneratedDeclaration): void => {
    if (visited.has(declaration.name)) {
      return;
    }
    if (visiting.has(declaration.name)) {
      return;
    }

    visiting.add(declaration.name);
    if (declaration.baseName !== undefined) {
      const baseDeclaration = declarationsByName.get(declaration.baseName);
      if (baseDeclaration !== undefined) {
        visit(baseDeclaration);
      }
    }
    visiting.delete(declaration.name);
    visited.add(declaration.name);
    sorted.push(declaration);
  };

  for (const declaration of [...declarations].sort((left, right) => left.name.localeCompare(right.name))) {
    visit(declaration);
  }

  return sorted;
};

const collectDeclarations = (files: readonly string[], state: GenerationState): readonly GeneratedDeclaration[] => {
  const declarations: GeneratedDeclaration[] = [];

  for (const file of files) {
    const sourceFile = sourceFileFor(file);
    for (const statement of sourceFile.statements) {
      const declaration = declarationFromStatement(statement, state);
      if (declaration !== undefined) {
        declarations.push(declaration);
      }
    }
  }

  return sortDeclarations(declarations);
};

const collectManagerProperties = (): readonly ManagerProperty[] => {
  const sourceFile = sourceFileFor(clientPath);
  const properties: ManagerProperty[] = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || statement.name?.text !== "BoxClient") {
      continue;
    }

    for (const member of statement.members) {
      if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name) || member.type === undefined) {
        continue;
      }
      if (!ts.isTypeReferenceNode(member.type)) {
        continue;
      }
      const className = typeNameText(member.type.typeName);
      if (className.endsWith("Manager")) {
        properties.push({ className, managerName: member.name.text });
      }
    }
  }

  return properties.sort((left, right) => left.managerName.localeCompare(right.managerName));
};

const unwrapPromise = (typeNode: ts.TypeNode): ts.TypeNode => {
  if (ts.isTypeReferenceNode(typeNode) && typeNameText(typeNode.typeName) === "Promise") {
    return typeNode.typeArguments?.[0] ?? typeNode;
  }
  return typeNode;
};

const methodHasDeprecatedTag = (member: ts.MethodDeclaration): boolean =>
  ts.getJSDocTags(member).some((tag) => tag.tagName.text === "deprecated") ||
  member.getFullText(member.getSourceFile()).includes("@deprecated");

const collectManagerMethods = (
  managerProperties: readonly ManagerProperty[],
  state: GenerationState
): {
  readonly deprecated: readonly string[];
  readonly generated: readonly ManagerMethod[];
  readonly skipped: readonly string[];
  readonly wrapped: readonly string[];
} => {
  const generated: ManagerMethod[] = [];
  const skipped: string[] = [];
  const deprecated: string[] = [];
  const wrapped: string[] = [];

  for (const property of managerProperties) {
    const managerFile = path.resolve(sdkRoot, "lib/managers", `${property.managerName}.d.ts`);
    const sourceFile = sourceFileFor(managerFile);

    for (const statement of sourceFile.statements) {
      if (!ts.isClassDeclaration(statement) || statement.name?.text !== property.className) {
        continue;
      }

      for (const member of statement.members) {
        if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name) || member.type === undefined) {
          continue;
        }

        const methodName = member.name.text;
        const fullMethodName = `${property.managerName}.${methodName}`;
        const signatureText = `${member.type.getText(sourceFile)} ${member.parameters.map((parameter) => parameter.type?.getText(sourceFile) ?? "").join(" ")}`;
        const referencesNonJson =
          typeReferencesNonJson(member.type, state) ||
          member.parameters.some(
            (parameter) => parameter.type !== undefined && typeReferencesNonJson(parameter.type, state)
          );

        if (methodHasDeprecatedTag(member)) {
          deprecated.push(fullMethodName);
          continue;
        }

        wrapped.push(fullMethodName);

        if (BYTE_OR_EVENT_PATTERN.test(signatureText) || referencesNonJson) {
          skipped.push(fullMethodName);
          continue;
        }

        const parameters = member.parameters.map((parameter) => ({
          name: parameter.name.getText(sourceFile),
          optional: parameter.questionToken !== undefined,
          schemaExpression: parameter.type === undefined ? "S.Unknown" : schemaForType(parameter.type, state),
          typeText: parameter.type?.getText(sourceFile) ?? "unknown",
        }));
        const operationName = `${toIdentifier(property.managerName)}${toIdentifier(methodName)}`;

        generated.push({
          className: property.className,
          fileName: path.basename(managerFile),
          fullMethodName,
          managerName: property.managerName,
          methodName,
          parameters,
          payloadName: `${operationName}Payload`,
          returnType: member.type.getText(sourceFile),
          successName: `${operationName}Success`,
          successSchemaExpression: schemaForType(unwrapPromise(member.type), state),
        });
      }
    }
  }

  return {
    deprecated: deprecated.sort((left, right) => left.localeCompare(right)),
    generated: generated.sort((left, right) => left.fullMethodName.localeCompare(right.fullMethodName)),
    skipped: skipped.sort((left, right) => left.localeCompare(right)),
    wrapped: wrapped.sort((left, right) => left.localeCompare(right)),
  };
};

const renderDeclaration = (declaration: GeneratedDeclaration): string => {
  const description = `Generated Box SDK schema for ${declaration.name}.`;
  const annotatedSchemaExpression = pipeExpression(
    declaration.schemaExpression ?? "S.Unknown",
    `$I.annoteSchema(${stringLiteral(declaration.name)}, {
    description: ${stringLiteral(description)}
  })`
  );

  if (declaration.kind === "type") {
    return `/**
 * ${description}
 *
 * @example
 * \`\`\`ts
 * import { ${declaration.name} } from "@beep/box"
 *
 * console.log(${declaration.name}.ast)
 * \`\`\`
 *
 * @category schemas
 * @since 0.0.0
 */
export const ${declaration.name} = ${annotatedSchemaExpression};

/**
 * Type for {@link ${declaration.name}}.
 *
 * @example
 * \`\`\`ts
 * import type { ${declaration.name} } from "@beep/box"
 *
 * type Value = ${declaration.name}
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export type ${declaration.name} = typeof ${declaration.name}.Type;
`;
  }

  const fields = renderStructFields((declaration.fields ?? []).map(renderField).join("\n    "));

  if (declaration.baseName !== undefined) {
    return `/**
 * ${description}
 *
 * @example
 * \`\`\`ts
 * import { ${declaration.name} } from "@beep/box"
 *
 * console.log(${declaration.name}.ast)
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export class ${declaration.name} extends ${declaration.baseName}.extend<${declaration.name}>($I\`${declaration.name}\`)(
  {${fields}},
  $I.annote(${stringLiteral(declaration.name)}, {
    description: ${stringLiteral(description)}
  })
) {}
`;
  }

  return `/**
 * ${description}
 *
 * @example
 * \`\`\`ts
 * import { ${declaration.name} } from "@beep/box"
 *
 * console.log(${declaration.name}.ast)
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export class ${declaration.name} extends S.Class<${declaration.name}>($I\`${declaration.name}\`)(
  {${fields}},
  $I.annote(${stringLiteral(declaration.name)}, {
    description: ${stringLiteral(description)}
  })
) {}
`;
};

const renderPayload = (method: ManagerMethod): string => {
  const fields = renderStructFields(
    method.parameters
      .map((parameter) =>
        renderField({
          name: propertyName(parameter.name),
          optional: parameter.optional,
          schemaExpression: parameter.schemaExpression,
        })
      )
      .join("\n    ")
  );
  const description = `Payload for Box SDK method ${method.fullMethodName}.`;

  return `/**
 * ${description}
 *
 * @example
 * \`\`\`ts
 * import { ${method.payloadName} } from "@beep/box"
 *
 * console.log(${method.payloadName}.ast)
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export class ${method.payloadName} extends S.Class<${method.payloadName}>($I\`${method.payloadName}\`)(
  {${fields}},
  $I.annote(${stringLiteral(method.payloadName)}, {
    description: ${stringLiteral(description)}
  })
) {}
`;
};

const renderSuccess = (method: ManagerMethod): string => {
  const description = `Decoded success value for Box SDK method ${method.fullMethodName}.`;
  const annotatedSchemaExpression = pipeExpression(
    method.successSchemaExpression,
    `$I.annoteSchema(${stringLiteral(method.successName)}, {
    description: ${stringLiteral(description)}
  })`
  );

  return `/**
 * ${description}
 *
 * @example
 * \`\`\`ts
 * import { ${method.successName} } from "@beep/box"
 *
 * console.log(${method.successName}.ast)
 * \`\`\`
 *
 * @category schemas
 * @since 0.0.0
 */
export const ${method.successName} = ${annotatedSchemaExpression};

/**
 * Type for {@link ${method.successName}}.
 *
 * @example
 * \`\`\`ts
 * import type { ${method.successName} } from "@beep/box"
 *
 * type Value = ${method.successName}
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export type ${method.successName} = typeof ${method.successName}.Type;
`;
};

const renderModelsFile = (
  declarations: readonly GeneratedDeclaration[],
  methods: readonly ManagerMethod[],
  methodNames: readonly string[]
): string => {
  const renderedMethodNames = methodNames.map(stringLiteral).join(",\n  ");

  return `/**
 * Generated Box SDK schemas, payloads, and success models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

// This file is generated by @beep/box/scripts/generate.ts. Do not edit manually.

import { $BoxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $BoxId.create("_generated/Box.models.gen");

/**
 * Serialized Box SDK JSON payloads.
 *
 * @example
 * \`\`\`ts
 * import { BoxSerializedData } from "@beep/box"
 *
 * console.log(BoxSerializedData.ast)
 * \`\`\`
 *
 * @category schemas
 * @since 0.0.0
 */
export const BoxSerializedData = S.Unknown.pipe(
  $I.annoteSchema("BoxSerializedData", {
    description: "Permissive schema for Box SDK SerializedData values."
  })
);

/**
 * Type for {@link BoxSerializedData}.
 *
 * @example
 * \`\`\`ts
 * import type { BoxSerializedData } from "@beep/box"
 *
 * type Value = BoxSerializedData
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export type BoxSerializedData = typeof BoxSerializedData.Type;

/**
 * Box SDK date wrapper or encoded date string.
 *
 * @example
 * \`\`\`ts
 * import { BoxSdkDate } from "@beep/box"
 *
 * console.log(BoxSdkDate.ast)
 * \`\`\`
 *
 * @category schemas
 * @since 0.0.0
 */
export const BoxSdkDate = S.Union([
  S.String,
  S.Struct({ value: S.Date })
]).pipe(
  $I.annoteSchema("BoxSdkDate", {
    description: "Box SDK Date wrapper or encoded date string."
  })
);

/**
 * Type for {@link BoxSdkDate}.
 *
 * @example
 * \`\`\`ts
 * import type { BoxSdkDate } from "@beep/box"
 *
 * type Value = BoxSdkDate
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export type BoxSdkDate = typeof BoxSdkDate.Type;

/**
 * Box SDK date-time wrapper or encoded date-time string.
 *
 * @example
 * \`\`\`ts
 * import { BoxSdkDateTime } from "@beep/box"
 *
 * console.log(BoxSdkDateTime.ast)
 * \`\`\`
 *
 * @category schemas
 * @since 0.0.0
 */
export const BoxSdkDateTime = S.Union([
  S.String,
  S.Struct({ value: S.Date })
]).pipe(
  $I.annoteSchema("BoxSdkDateTime", {
    description: "Box SDK DateTime wrapper or encoded date-time string."
  })
);

/**
 * Type for {@link BoxSdkDateTime}.
 *
 * @example
 * \`\`\`ts
 * import type { BoxSdkDateTime } from "@beep/box"
 *
 * type Value = BoxSdkDateTime
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export type BoxSdkDateTime = typeof BoxSdkDateTime.Type;

/**
 * Generated Box SDK method names wrapped by \\@beep/box.
 *
 * @example
 * \`\`\`ts
 * import { BoxMethodName } from "@beep/box"
 *
 * console.log(BoxMethodName.is["files.getFileById"]("files.getFileById"))
 * \`\`\`
 *
 * @category schemas
 * @since 0.0.0
 */
export const BoxMethodName = LiteralKit([
  ${renderedMethodNames}
]).pipe(
  $I.annoteSchema("BoxMethodName", {
    description: "Generated Box SDK method names wrapped by the Box technical driver."
  })
);

/**
 * Type for {@link BoxMethodName}.
 *
 * @example
 * \`\`\`ts
 * import type { BoxMethodName } from "@beep/box"
 *
 * const method: BoxMethodName = "files.getFileById"
 * console.log(method)
 * \`\`\`
 *
 * @category models
 * @since 0.0.0
 */
export type BoxMethodName = typeof BoxMethodName.Type;

${declarations.map(renderDeclaration).join("\n")}
${methods.map(renderPayload).join("\n")}
${methods.map(renderSuccess).join("\n")}
`;
};

const renderOperationShape = (managerName: string, methods: readonly ManagerMethod[]): string =>
  `readonly ${propertyName(managerName)}: {\n${methods
    .map(
      (method) =>
        `    readonly ${propertyName(method.methodName)}: (payload: M.${method.payloadName}) => Effect.Effect<M.${method.successName}, BoxError>;`
    )
    .join("\n")}\n  };`;

const argumentExpression = (parameter: MethodParameter): string => {
  if (parameter.name === "cancellationToken") {
    return `combineCancellationToken(decoded.${parameter.name}, signal)`;
  }
  if (parameter.name === "optionalsInput") {
    return `mergeCancellation(decoded.${parameter.name}, signal)`;
  }
  return `decoded.${parameter.name}`;
};

const renderOperationMethod = (method: ManagerMethod): string =>
  `${propertyName(method.methodName)}: (payload) =>
      runSdkCall(
        ${stringLiteral(method.managerName)},
        ${stringLiteral(method.methodName)},
        ${stringLiteral(method.fullMethodName)},
        M.${method.payloadName},
        M.${method.successName},
        payload,
        (decoded, signal) =>
          invokeSdkMethod(client, ${stringLiteral(method.managerName)}, ${stringLiteral(method.methodName)}, [
            ${method.parameters.map(argumentExpression).join(",\n            ")}
          ])
      ),`;

const renderOperationManager = (managerName: string, methods: readonly ManagerMethod[]): string =>
  `${propertyName(managerName)}: {
    ${methods.map(renderOperationMethod).join("\n    ")}
  },`;

const renderOperationsFile = (methods: readonly ManagerMethod[]): string => {
  const byManager = Map.groupBy(methods, (method) => method.managerName);
  const sortedManagers = [...byManager.keys()].sort((left, right) => left.localeCompare(right));

  return `/**
 * Generated Box SDK operation wrappers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

// This file is generated by @beep/box/scripts/generate.ts. Do not edit manually.

import { Effect, Result } from "effect";
import * as P from "effect/Predicate";
import type * as S from "effect/Schema";
import type { BoxError } from "../Box.errors.ts";
import * as M from "./Box.models.gen.ts";

/**
 * Shared generated operation runner supplied by {@link Box}.
 *
 * @example
 * \`\`\`ts
 * import type { BoxRunSdkCall } from "@beep/box/Box.operations.gen"
 *
 * type Runner = BoxRunSdkCall
 * \`\`\`
 *
 * @category services
 * @since 0.0.0
 */
export type BoxRunSdkCall = <Payload, Success>(
  manager: string,
  method: string,
  methodName: M.BoxMethodName,
  payloadSchema: S.ConstraintDecoder<Payload>,
  successSchema: S.ConstraintDecoder<Success>,
  payload: Payload,
  invoke: (decoded: Payload, signal: AbortSignal | undefined) => Promise<unknown>
) => Effect.Effect<Success, BoxError>;

/**
 * Generated JSON operation groups for the Box SDK.
 *
 * @example
 * \`\`\`ts
 * import type { BoxGeneratedOperations } from "@beep/box/Box.operations.gen"
 *
 * type Managers = keyof BoxGeneratedOperations
 * \`\`\`
 *
 * @category services
 * @since 0.0.0
 */
export type BoxGeneratedOperations = {
  ${sortedManagers.map((managerName) => renderOperationShape(managerName, byManager.get(managerName) ?? [])).join("\n  ")}
};

const readProperty = (value: unknown, key: PropertyKey): unknown => (P.isObject(value) ? Reflect.get(value, key) : undefined);

const readCancellationToken = (value: unknown): AbortSignal | undefined => {
  const token = readProperty(value, "cancellationToken");
  return token instanceof AbortSignal ? token : undefined;
};

const combineCancellationToken = (
  callerSignal: AbortSignal | undefined,
  driverSignal: AbortSignal | undefined
): AbortSignal | undefined => {
  if (callerSignal === undefined) {
    return driverSignal;
  }
  if (driverSignal === undefined || callerSignal === driverSignal) {
    return callerSignal;
  }
  return AbortSignal.any([callerSignal, driverSignal]);
};

const mergeCancellation = <A>(
  input: A | undefined,
  signal: AbortSignal | undefined
): A | { readonly cancellationToken: AbortSignal } | undefined => {
  const cancellationToken = combineCancellationToken(readCancellationToken(input), signal);
  if (cancellationToken === undefined) {
    return input;
  }
  if (P.isObject(input)) {
    return { ...input, cancellationToken };
  }
  return { cancellationToken };
};

const sdkShapeFailure = (manager: string, method: string): Promise<never> =>
  Promise.reject({
    _tag: "BoxSdkShapeError",
    manager,
    method
  });

const invokeSdkMethod = (
  client: unknown,
  manager: string,
  method: string,
  args: ReadonlyArray<unknown>
): Promise<unknown> => {
  const managerValue = readProperty(client, manager);
  const methodValue = readProperty(managerValue, method);

  if (!P.isFunction(methodValue)) {
    return sdkShapeFailure(manager, method);
  }

  const result = Result.try(() => Reflect.apply(methodValue, managerValue, args));
  return Result.match(result, {
    onFailure: (cause) => Promise.reject(cause),
    onSuccess: (value) => Promise.resolve(value)
  });
};

/**
 * Build generated Box SDK operation groups from a SDK client and shared runner.
 *
 * @example
 * \`\`\`ts
 * import { makeGeneratedOperations } from "@beep/box/Box.operations.gen"
 *
 * console.log(makeGeneratedOperations)
 * \`\`\`
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeGeneratedOperations = (client: unknown, runSdkCall: BoxRunSdkCall): BoxGeneratedOperations => ({
  ${sortedManagers.map((managerName) => renderOperationManager(managerName, byManager.get(managerName) ?? [])).join("\n  ")}
});
`;
};

const main = (): void => {
  const sourceFiles = schemaDirectories.flatMap(findFiles);
  const declarationNames = collectDeclarationNames(sourceFiles);
  const nonJsonDeclarationNames = collectNonJsonDeclarationNames(sourceFiles);
  const state: GenerationState = {
    constrainedTypes: new Set<string>(),
    declarationNames,
    nonJsonDeclarationNames,
  };
  const declarations = collectDeclarations(sourceFiles, state);
  const managerProperties = collectManagerProperties();
  const methods = collectManagerMethods(managerProperties, state);

  writeFile(modelsOutputPath, renderModelsFile(declarations, methods.generated, methods.wrapped));
  writeFile(operationsOutputPath, renderOperationsFile(methods.generated));

  console.log(`Generated ${declarations.length} Box model schemas.`);
  console.log(`Generated ${methods.generated.length} Box JSON operations.`);
  console.log(`Skipped ${methods.skipped.length} byte/event operations: ${methods.skipped.join(", ") || "none"}.`);
  console.log(
    `Skipped ${methods.deprecated.length} deprecated operations: ${methods.deprecated.join(", ") || "none"}.`
  );
  console.log(
    `Constrained dynamic SDK types: ${[...state.constrainedTypes].sort((left, right) => left.localeCompare(right)).join(", ") || "none"}.`
  );
};

main();
