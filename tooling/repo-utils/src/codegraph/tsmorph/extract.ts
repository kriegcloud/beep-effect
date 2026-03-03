// cspell:ignore tsconfig tsmorph scip Decoratable
import { createHash } from "node:crypto";
import { Effect, HashSet, MutableHashMap, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  type ArrowFunction,
  type ClassDeclaration,
  type ConstructorDeclaration,
  type FunctionDeclaration,
  type FunctionExpression,
  type GetAccessorDeclaration,
  type InterfaceDeclaration,
  type MethodDeclaration,
  Node,
  type Project,
  type PropertyDeclaration,
  type SetAccessorDeclaration,
  type SourceFile,
  SyntaxKind,
  type Type,
  type TypeAliasDeclaration,
  type VariableDeclaration,
  type VariableStatement,
} from "ts-morph";
import { CodebaseGraph, type EdgeKind, type NodeKind } from "../models.js";
import { TsMorphExtractionError } from "./errors.js";
import type { TsMorphProjectContext } from "./models.js";

interface EncodedGraphNode {
  readonly kind: NodeKind;
  readonly id: string;
  readonly label: string;
  readonly filePath: string;
  readonly line: number;
  readonly endline: number;
  readonly exported: boolean;
  readonly meta?: Readonly<Record<string, unknown>>;
}

interface EncodedGraphEdge {
  readonly kind: EdgeKind;
  readonly source: string;
  readonly target: string;
  readonly label?: string;
  readonly meta?: Readonly<Record<string, unknown>>;
}

const normalizePath = (value: string): string => Str.replace(/\\/g, "/")(value);

const toRelativePath = (path: Path.Path, absolutePath: string, rootDir: string): string =>
  normalizePath(path.relative(rootDir, absolutePath));

const normalizeText = (value: string): string => Str.replace(/\s+/g, " ")(Str.trim(value));

const toLookupLabel = (value: string): string => {
  const withoutGenerics = pipe(
    Str.split("<")(value),
    A.head,
    O.getOrElse(() => value)
  );
  const segments = Str.split(".")(withoutGenerics);
  return normalizeText(
    pipe(
      segments,
      A.last,
      O.getOrElse(() => withoutGenerics)
    )
  );
};

const extractTypeReferenceLabels = (value: string): ReadonlyArray<string> =>
  pipe(Str.match(/[A-Za-z_$][A-Za-z0-9_$]*/g)(value) ?? [], A.map(toLookupLabel), A.filter(Str.isNonEmpty));

const sha256Hex = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

const makeNodeId = (
  kind: NodeKind,
  filePath: string,
  name: string,
  workspace: string,
  mode: "graph-v2" | "scip-hash"
): string => {
  const normalizedFilePath = normalizePath(filePath);
  const normalizedName = normalizeText(name);

  if (mode === "graph-v2") {
    return `${kind}::${normalizedFilePath}::${normalizedName}`;
  }

  const digest = sha256Hex([workspace, normalizedFilePath, normalizedName, kind].join("|"));
  return `${workspace}::${normalizedFilePath}::${normalizedName}::${kind}::${digest}`;
};

const guessPackageName = (filePath: string): O.Option<readonly [string, string]> => {
  const segments = Str.split("/")(filePath);
  const head = segments[0];
  const name = segments[1];

  if ((head === "packages" || head === "apps" || head === "tooling") && name !== undefined) {
    return O.some([`${head}/${name}`, `${head}/${name}`] as const);
  }

  return O.none();
};

const isNodeExported = (node: Node): boolean => (Node.isExportable(node) ? node.isExported() : false);

const endLine = (node: Node): number => {
  try {
    return node.getEndLineNumber();
  } catch {
    return node.getStartLineNumber();
  }
};

const getFunctionParams = (
  fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | ConstructorDeclaration
): string => {
  try {
    return pipe(
      fn.getParameters(),
      A.map((parameter) => {
        const name = parameter.getName();
        const type = parameter.getType().getText(parameter);
        return `${name}: ${type}`;
      }),
      A.join(", ")
    );
  } catch {
    return "";
  }
};

const getReturnTypeText = (
  fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | GetAccessorDeclaration
): string => {
  try {
    return fn.getReturnType().getText(fn);
  } catch {
    return "unknown";
  }
};

const isConditionalCall = (node: Node): boolean => {
  let current = node.getParent();

  while (current !== undefined) {
    if (
      Node.isIfStatement(current) ||
      Node.isConditionalExpression(current) ||
      Node.isTryStatement(current) ||
      Node.isCatchClause(current) ||
      Node.isSwitchStatement(current)
    ) {
      return true;
    }

    if (
      Node.isFunctionDeclaration(current) ||
      Node.isMethodDeclaration(current) ||
      Node.isArrowFunction(current) ||
      Node.isConstructorDeclaration(current)
    ) {
      return false;
    }

    current = current.getParent();
  }

  return false;
};

const isTestFile = (filePath: string): boolean =>
  Str.includes(".test.")(filePath) ||
  Str.includes(".spec.")(filePath) ||
  Str.includes("__tests__/")(filePath) ||
  Str.includes("__test__/")(filePath);

const isJsxComponent = (decl: VariableDeclaration | FunctionDeclaration): boolean => {
  try {
    const returnType = decl.getType().getText(decl);
    if (
      Str.includes("JSX.Element")(returnType) ||
      Str.includes("ReactElement")(returnType) ||
      Str.includes("ReactNode")(returnType)
    ) {
      return true;
    }

    return (
      decl.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
      decl.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0
    );
  } catch {
    return false;
  }
};

class GraphBuilder {
  private readonly nodes: MutableHashMap.MutableHashMap<string, EncodedGraphNode>;
  private readonly edges: MutableHashMap.MutableHashMap<string, EncodedGraphEdge>;
  private readonly packageByFile: MutableHashMap.MutableHashMap<string, string>;
  private readonly rootDir: string;
  private readonly path: Path.Path;
  private readonly workspace: string;
  private readonly idMode: "graph-v2" | "scip-hash";

  constructor(path: Path.Path, rootDir: string, workspace: string, idMode: "graph-v2" | "scip-hash") {
    this.nodes = MutableHashMap.empty<string, EncodedGraphNode>();
    this.edges = MutableHashMap.empty<string, EncodedGraphEdge>();
    this.packageByFile = MutableHashMap.empty<string, string>();
    this.path = path;
    this.rootDir = rootDir;
    this.workspace = workspace;
    this.idMode = idMode;
  }

  private addNode(node: EncodedGraphNode): void {
    if (!MutableHashMap.has(this.nodes, node.id)) {
      MutableHashMap.set(this.nodes, node.id, node);
    }
  }

  private addEdge(edge: EncodedGraphEdge): void {
    const key = `${edge.source}::${edge.target}::${edge.kind}::${edge.label ?? ""}`;
    if (!MutableHashMap.has(this.edges, key)) {
      MutableHashMap.set(this.edges, key, edge);
    }
  }

  private fileNodeId(filePath: string): string {
    return makeNodeId("file", filePath, this.path.basename(filePath), this.workspace, this.idMode);
  }

  private packageNodeId(packagePath: string): string {
    return makeNodeId("package", packagePath, packagePath, this.workspace, this.idMode);
  }

  private nodeId(kind: NodeKind, filePath: string, name: string): string {
    return makeNodeId(kind, filePath, name, this.workspace, this.idMode);
  }

  private resolveSymbolNodeId(filePath: string, symbolName: string): O.Option<string> {
    const kinds: ReadonlyArray<NodeKind> = [
      "function",
      "jsx_component",
      "class",
      "interface",
      "type_alias",
      "enum",
      "variable",
      "method",
      "property",
      "getter",
      "setter",
      "constructor",
      "parameter",
      "module_declaration",
      "decorator",
      "namespace",
      "enum_member",
    ];

    for (const kind of kinds) {
      const id = this.nodeId(kind, filePath, symbolName);
      if (MutableHashMap.has(this.nodes, id)) {
        return O.some(id);
      }
    }

    return O.none();
  }

  private findNodeIdsByLabel(label: string, kinds: ReadonlyArray<NodeKind>): ReadonlyArray<string> {
    const normalizedLabel = normalizeText(label);
    const values = Array.from(MutableHashMap.values(this.nodes));
    const matchingIds = pipe(
      values,
      A.filter((node) => A.contains(kinds, node.kind) && normalizeText(node.label) === normalizedLabel),
      A.map((node) => node.id)
    );

    return pipe(HashSet.fromIterable(matchingIds), A.fromIterable, A.sort(Order.String));
  }

  private findEnclosingSymbolId(node: Node, filePath: string): O.Option<string> {
    let current = node.getParent();

    while (current !== undefined) {
      if (Node.isFunctionDeclaration(current)) {
        const name = current.getName() ?? `<anonymous:${current.getStartLineNumber()}>`;
        const candidates = [this.nodeId("function", filePath, name), this.nodeId("jsx_component", filePath, name)];

        for (const candidate of candidates) {
          if (MutableHashMap.has(this.nodes, candidate)) {
            return O.some(candidate);
          }
        }
      }

      if (Node.isMethodDeclaration(current)) {
        const cls = current.getParentIfKind(SyntaxKind.ClassDeclaration);
        const clsName = cls?.getName() ?? "";
        return O.some(this.nodeId("method", filePath, `${clsName}.${current.getName()}`));
      }

      if (Node.isConstructorDeclaration(current)) {
        const cls = current.getParentIfKind(SyntaxKind.ClassDeclaration);
        const clsName = cls?.getName() ?? "";
        return O.some(this.nodeId("constructor", filePath, `${clsName}.constructor`));
      }

      if (Node.isGetAccessorDeclaration(current)) {
        const cls = current.getParentIfKind(SyntaxKind.ClassDeclaration);
        const clsName = cls?.getName() ?? "";
        return O.some(this.nodeId("getter", filePath, `${clsName}.get:${current.getName()}`));
      }

      if (Node.isSetAccessorDeclaration(current)) {
        const cls = current.getParentIfKind(SyntaxKind.ClassDeclaration);
        const clsName = cls?.getName() ?? "";
        return O.some(this.nodeId("setter", filePath, `${clsName}.set:${current.getName()}`));
      }

      if (Node.isArrowFunction(current)) {
        const variable = current.getParentIfKind(SyntaxKind.VariableDeclaration);
        const name = variable?.getName();
        if (name !== undefined) {
          const candidates = [this.nodeId("function", filePath, name), this.nodeId("jsx_component", filePath, name)];

          for (const candidate of candidates) {
            if (MutableHashMap.has(this.nodes, candidate)) {
              return O.some(candidate);
            }
          }
        }
      }

      current = current.getParent();
    }

    return O.none();
  }

  private addPackageForFile(filePath: string): void {
    const packageInfo = guessPackageName(filePath);

    if (O.isSome(packageInfo)) {
      const [packageName, packagePath] = packageInfo.value;
      MutableHashMap.set(this.packageByFile, filePath, packageName);

      const packageId = this.packageNodeId(packagePath);
      this.addNode({
        id: packageId,
        kind: "package",
        label: packageName,
        filePath: packagePath,
        line: 0,
        endline: 0,
        exported: true,
        meta: { packagePath },
      });

      this.addEdge({
        source: packageId,
        target: this.fileNodeId(filePath),
        kind: "contains",
      });
    }
  }

  private addDecoratorNodes(node: Node, filePath: string, parentId: string): void {
    if (!Node.isDecoratable(node)) {
      return;
    }

    for (const decorator of node.getDecorators()) {
      const name = decorator.getName();
      const parentLabel = pipe(
        Str.split("::")(parentId),
        A.last,
        O.getOrElse(() => parentId)
      );
      const decoratorId = this.nodeId("decorator", filePath, `${parentLabel}@${name}`);
      const argumentsText = pipe(
        decorator.getArguments(),
        A.map((argument) => argument.getText()),
        A.join(", ")
      );

      this.addNode({
        id: decoratorId,
        kind: "decorator",
        label: `@${name}`,
        filePath,
        line: decorator.getStartLineNumber(),
        endline: endLine(decorator),
        exported: false,
        meta: {
          name,
          arguments: argumentsText.length > 0 ? argumentsText : undefined,
        },
      });

      this.addEdge({
        source: decoratorId,
        target: parentId,
        kind: "decorates",
      });
    }
  }

  private extractParameters(
    fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | ConstructorDeclaration,
    filePath: string,
    parentId: string
  ): void {
    for (const parameter of fn.getParameters()) {
      const name = parameter.getName();
      const parentLabel = pipe(
        Str.split("::")(parentId),
        A.last,
        O.getOrElse(() => parentId)
      );
      const paramId = this.nodeId("parameter", filePath, `${parentLabel}.${name}`);
      const typeText = parameter.getType().getText(parameter);

      this.addNode({
        id: paramId,
        kind: "parameter",
        label: name,
        filePath,
        line: parameter.getStartLineNumber(),
        endline: endLine(parameter),
        exported: false,
        meta: {
          type: typeText,
          optional: parameter.isOptional(),
          rest: parameter.isRestParameter(),
          hasDefault: parameter.hasInitializer(),
        },
      });

      this.addEdge({
        source: parentId,
        target: paramId,
        kind: "has_parameter",
      });

      this.extractTypeReferences(parameter, paramId);
    }
  }

  private extractFunctionNode(fn: FunctionDeclaration, filePath: string, parentId: string): void {
    const name = fn.getName() ?? `<anonymous:${fn.getStartLineNumber()}>`;
    const kind: NodeKind = isJsxComponent(fn) ? "jsx_component" : "function";
    const fnId = this.nodeId(kind, filePath, name);

    this.addNode({
      id: fnId,
      kind,
      label: name,
      filePath,
      line: fn.getStartLineNumber(),
      endline: endLine(fn),
      exported: isNodeExported(fn),
      meta: {
        params: getFunctionParams(fn),
        returnType: getReturnTypeText(fn),
        async: fn.isAsync(),
        generator: fn.isGenerator(),
        parameterCount: fn.getParameters().length,
        typeParameterCount: fn.getTypeParameters().length,
      },
    });

    this.addEdge({
      source: parentId,
      target: fnId,
      kind: "contains",
    });

    this.extractParameters(fn, filePath, fnId);
    this.addDecoratorNodes(fn, filePath, fnId);
    this.extractTypeReferences(fn, fnId);
  }

  private extractVariableStatementNode(statement: VariableStatement, filePath: string, parentId: string): void {
    for (const declaration of statement.getDeclarations()) {
      const name = declaration.getName();
      const initializer = declaration.getInitializer();

      if (initializer !== undefined && Node.isArrowFunction(initializer)) {
        const kind: NodeKind = isJsxComponent(declaration) ? "jsx_component" : "function";
        const fnId = this.nodeId(kind, filePath, name);

        this.addNode({
          id: fnId,
          kind,
          label: name,
          filePath,
          line: declaration.getStartLineNumber(),
          endline: endLine(declaration),
          exported: isNodeExported(statement),
          meta: {
            params: getFunctionParams(initializer),
            returnType: getReturnTypeText(initializer),
            async: initializer.isAsync(),
            arrow: true,
            parameterCount: initializer.getParameters().length,
            typeParameterCount: initializer.getTypeParameters().length,
          },
        });

        this.addEdge({
          source: parentId,
          target: fnId,
          kind: "contains",
        });

        this.extractParameters(initializer, filePath, fnId);
        this.extractTypeReferences(initializer, fnId);
        continue;
      }

      const variableId = this.nodeId("variable", filePath, name);
      const typeText = declaration.getType().getText(declaration);

      this.addNode({
        id: variableId,
        kind: "variable",
        label: name,
        filePath,
        line: declaration.getStartLineNumber(),
        endline: endLine(declaration),
        exported: isNodeExported(statement),
        meta: {
          type: typeText,
          declarationKind: String(statement.getDeclarationKind()),
        },
      });

      this.addEdge({
        source: parentId,
        target: variableId,
        kind: "contains",
      });

      this.extractTypeReferences(declaration, variableId);
    }
  }

  private extractClassNode(cls: ClassDeclaration, filePath: string, fileId: string): void {
    const className = cls.getName() ?? `<anonymous:${cls.getStartLineNumber()}>`;
    const classId = this.nodeId("class", filePath, className);

    this.addNode({
      id: classId,
      kind: "class",
      label: className,
      filePath,
      line: cls.getStartLineNumber(),
      endline: endLine(cls),
      exported: isNodeExported(cls),
      meta: {
        abstract: cls.isAbstract(),
        methodCount: cls.getMethods().length,
        propertyCount: cls.getProperties().length,
        constructorCount: cls.getConstructors().length,
        getterCount: cls.getGetAccessors().length,
        setterCount: cls.getSetAccessors().length,
        typeParameterCount: cls.getTypeParameters().length,
      },
    });

    this.addEdge({ source: fileId, target: classId, kind: "contains" });
    this.addDecoratorNodes(cls, filePath, classId);

    for (const constructorDeclaration of cls.getConstructors()) {
      this.extractConstructorNode(constructorDeclaration, filePath, className, classId);
    }

    for (const method of cls.getMethods()) {
      this.extractMethodNode(method, filePath, className, classId);
    }

    for (const property of cls.getProperties()) {
      this.extractPropertyNode(property, filePath, className, classId);
    }

    for (const getter of cls.getGetAccessors()) {
      this.extractGetterNode(getter, filePath, className, classId);
    }

    for (const setter of cls.getSetAccessors()) {
      this.extractSetterNode(setter, filePath, className, classId);
    }
  }

  private extractConstructorNode(
    constructorDeclaration: ConstructorDeclaration,
    filePath: string,
    className: string,
    classId: string
  ): void {
    const constructorId = this.nodeId("constructor", filePath, `${className}.constructor`);

    this.addNode({
      id: constructorId,
      kind: "constructor",
      label: `${className}.constructor`,
      filePath,
      line: constructorDeclaration.getStartLineNumber(),
      endline: endLine(constructorDeclaration),
      exported: false,
      meta: {
        className,
        params: getFunctionParams(constructorDeclaration),
        parameterCount: constructorDeclaration.getParameters().length,
      },
    });

    this.addEdge({ source: classId, target: constructorId, kind: "has_constructor" });
    this.extractParameters(constructorDeclaration, filePath, constructorId);

    for (const parameter of constructorDeclaration.getParameters()) {
      const scope = parameter.getScope();
      if (scope === undefined && !parameter.isReadonly()) {
        continue;
      }

      const propertyName = parameter.getName();
      const propertyId = this.nodeId("property", filePath, `${className}.${propertyName}`);
      const typeText = parameter.getType().getText(parameter);

      this.addNode({
        id: propertyId,
        kind: "property",
        label: `${className}.${propertyName}`,
        filePath,
        line: parameter.getStartLineNumber(),
        endline: endLine(parameter),
        exported: false,
        meta: {
          className,
          type: typeText,
          visibility: scope ?? "public",
          readonly: parameter.isReadonly(),
          parameterProperty: true,
        },
      });

      this.addEdge({ source: classId, target: propertyId, kind: "has_property" });
    }
  }

  private extractMethodNode(method: MethodDeclaration, filePath: string, className: string, classId: string): void {
    const methodName = method.getName();
    const methodId = this.nodeId("method", filePath, `${className}.${methodName}`);

    this.addNode({
      id: methodId,
      kind: "method",
      label: `${className}.${methodName}`,
      filePath,
      line: method.getStartLineNumber(),
      endline: endLine(method),
      exported: isNodeExported(method.getParentIfKindOrThrow(SyntaxKind.ClassDeclaration)),
      meta: {
        className,
        params: getFunctionParams(method),
        returnType: getReturnTypeText(method),
        static: method.isStatic(),
        async: method.isAsync(),
        abstract: method.isAbstract(),
        visibility: method.getScope() ?? "public",
        parameterCount: method.getParameters().length,
        typeParameterCount: method.getTypeParameters().length,
      },
    });

    this.addEdge({ source: classId, target: methodId, kind: "has_method" });
    this.addDecoratorNodes(method, filePath, methodId);
    this.extractParameters(method, filePath, methodId);
    this.extractTypeReferences(method, methodId);
  }

  private extractPropertyNode(
    property: PropertyDeclaration,
    filePath: string,
    className: string,
    classId: string
  ): void {
    const propertyName = property.getName();
    const propertyId = this.nodeId("property", filePath, `${className}.${propertyName}`);
    const typeText = property.getType().getText(property);

    this.addNode({
      id: propertyId,
      kind: "property",
      label: `${className}.${propertyName}`,
      filePath,
      line: property.getStartLineNumber(),
      endline: endLine(property),
      exported: false,
      meta: {
        className,
        type: typeText,
        static: property.isStatic(),
        readonly: property.isReadonly(),
        abstract: property.isAbstract(),
        optional: property.hasQuestionToken(),
        visibility: property.getScope() ?? "public",
      },
    });

    this.addEdge({ source: classId, target: propertyId, kind: "has_property" });
    this.addDecoratorNodes(property, filePath, propertyId);
    this.extractTypeReferences(property, propertyId);
  }

  private extractGetterNode(
    getter: GetAccessorDeclaration,
    filePath: string,
    className: string,
    classId: string
  ): void {
    const getterName = getter.getName();
    const getterId = this.nodeId("getter", filePath, `${className}.get:${getterName}`);

    this.addNode({
      id: getterId,
      kind: "getter",
      label: `${className}.get ${getterName}`,
      filePath,
      line: getter.getStartLineNumber(),
      endline: endLine(getter),
      exported: false,
      meta: {
        className,
        returnType: getReturnTypeText(getter),
        static: getter.isStatic(),
        visibility: getter.getScope() ?? "public",
      },
    });

    this.addEdge({ source: classId, target: getterId, kind: "has_getter" });
    this.addDecoratorNodes(getter, filePath, getterId);
  }

  private extractSetterNode(
    setter: SetAccessorDeclaration,
    filePath: string,
    className: string,
    classId: string
  ): void {
    const setterName = setter.getName();
    const setterId = this.nodeId("setter", filePath, `${className}.set:${setterName}`);
    const firstParameter = setter.getParameters()[0];

    const parameterType = firstParameter === undefined ? "unknown" : firstParameter.getType().getText(firstParameter);

    this.addNode({
      id: setterId,
      kind: "setter",
      label: `${className}.set ${setterName}`,
      filePath,
      line: setter.getStartLineNumber(),
      endline: endLine(setter),
      exported: false,
      meta: {
        className,
        parameterType,
        static: setter.isStatic(),
        visibility: setter.getScope() ?? "public",
      },
    });

    this.addEdge({ source: classId, target: setterId, kind: "has_setter" });
    this.addDecoratorNodes(setter, filePath, setterId);
  }

  private extractInterfaceNode(interfaceDeclaration: InterfaceDeclaration, filePath: string, fileId: string): void {
    const name = interfaceDeclaration.getName();
    const interfaceId = this.nodeId("interface", filePath, name);

    this.addNode({
      id: interfaceId,
      kind: "interface",
      label: name,
      filePath,
      line: interfaceDeclaration.getStartLineNumber(),
      endline: endLine(interfaceDeclaration),
      exported: isNodeExported(interfaceDeclaration),
      meta: {
        propertyCount: interfaceDeclaration.getProperties().length,
        methodCount: interfaceDeclaration.getMethods().length,
        typeParameterCount: interfaceDeclaration.getTypeParameters().length,
        extendsCount: interfaceDeclaration.getExtends().length,
      },
    });

    this.addEdge({ source: fileId, target: interfaceId, kind: "contains" });

    for (const property of interfaceDeclaration.getProperties()) {
      const propertyName = property.getName();
      const propertyId = this.nodeId("property", filePath, `${name}.${propertyName}`);
      const typeText = property.getType().getText(property);

      this.addNode({
        id: propertyId,
        kind: "property",
        label: `${name}.${propertyName}`,
        filePath,
        line: property.getStartLineNumber(),
        endline: endLine(property),
        exported: false,
        meta: {
          parentInterface: name,
          type: typeText,
          optional: property.hasQuestionToken(),
          readonly: property.isReadonly(),
        },
      });

      this.addEdge({ source: interfaceId, target: propertyId, kind: "has_property" });
      this.extractTypeReferences(property, propertyId);
    }

    for (const method of interfaceDeclaration.getMethods()) {
      const methodName = method.getName();
      const methodId = this.nodeId("method", filePath, `${name}.${methodName}`);

      this.addNode({
        id: methodId,
        kind: "method",
        label: `${name}.${methodName}`,
        filePath,
        line: method.getStartLineNumber(),
        endline: endLine(method),
        exported: false,
        meta: {
          parentInterface: name,
          params: pipe(
            method.getParameters(),
            A.map((parameter) => `${parameter.getName()}: ${parameter.getType().getText(parameter)}`),
            A.join(", ")
          ),
          returnType: method.getReturnType().getText(method),
          typeParameterCount: method.getTypeParameters().length,
        },
      });

      this.addEdge({ source: interfaceId, target: methodId, kind: "has_method" });
      this.extractTypeReferences(method, methodId);
    }
  }

  private extractTypeAliasNode(typeAlias: TypeAliasDeclaration, filePath: string, fileId: string): void {
    const name = typeAlias.getName();
    const typeAliasId = this.nodeId("type_alias", filePath, name);
    const typeText = typeAlias.getType().getText(typeAlias);

    this.addNode({
      id: typeAliasId,
      kind: "type_alias",
      label: name,
      filePath,
      line: typeAlias.getStartLineNumber(),
      endline: endLine(typeAlias),
      exported: isNodeExported(typeAlias),
      meta: {
        type: typeText,
        typeParameterCount: typeAlias.getTypeParameters().length,
        isUnion: Str.includes("|")(typeText),
        isIntersection: Str.includes("&")(typeText),
      },
    });

    this.addEdge({ source: fileId, target: typeAliasId, kind: "contains" });
    this.extractTypeReferences(typeAlias, typeAliasId);
  }

  private extractEnumNode(enumDeclaration: import("ts-morph").EnumDeclaration, filePath: string, fileId: string): void {
    const name = enumDeclaration.getName();
    const enumId = this.nodeId("enum", filePath, name);

    this.addNode({
      id: enumId,
      kind: "enum",
      label: name,
      filePath,
      line: enumDeclaration.getStartLineNumber(),
      endline: endLine(enumDeclaration),
      exported: isNodeExported(enumDeclaration),
      meta: {
        memberCount: enumDeclaration.getMembers().length,
        isConst: enumDeclaration.isConstEnum(),
      },
    });

    this.addEdge({ source: fileId, target: enumId, kind: "contains" });

    for (const member of enumDeclaration.getMembers()) {
      const memberName = member.getName();
      const memberId = this.nodeId("enum_member", filePath, `${name}.${memberName}`);

      this.addNode({
        id: memberId,
        kind: "enum_member",
        label: `${name}.${memberName}`,
        filePath,
        line: member.getStartLineNumber(),
        endline: endLine(member),
        exported: false,
        meta: {
          parentEnum: name,
          value: member.getValue(),
        },
      });

      this.addEdge({ source: enumId, target: memberId, kind: "has_member" });
    }
  }

  private extractModuleDeclarations(file: SourceFile, filePath: string, fileId: string): void {
    for (const moduleDeclaration of file.getModules()) {
      const name = moduleDeclaration.getName();
      const moduleId = this.nodeId("module_declaration", filePath, name);
      const isNamespace = /^\s*(export\s+)?namespace\b/.test(moduleDeclaration.getText());

      this.addNode({
        id: moduleId,
        kind: "module_declaration",
        label: name,
        filePath,
        line: moduleDeclaration.getStartLineNumber(),
        endline: endLine(moduleDeclaration),
        exported: isNodeExported(moduleDeclaration),
        meta: {
          isAmbient: moduleDeclaration.hasDeclareKeyword(),
          isNamespace,
        },
      });

      this.addEdge({ source: fileId, target: moduleId, kind: "contains" });

      if (isNamespace) {
        const namespaceId = this.nodeId("namespace", filePath, name);
        this.addNode({
          id: namespaceId,
          kind: "namespace",
          label: name,
          filePath,
          line: moduleDeclaration.getStartLineNumber(),
          endline: endLine(moduleDeclaration),
          exported: isNodeExported(moduleDeclaration),
          meta: {
            fromModuleDeclaration: true,
          },
        });

        this.addEdge({ source: fileId, target: namespaceId, kind: "contains" });
      }
    }
  }

  private extractTypeReferences(node: Node, sourceId: string): void {
    node.forEachDescendant((descendant) => {
      if (!Node.isTypeReference(descendant)) {
        return;
      }

      const typeName = descendant.getTypeName().getText();
      const symbol = descendant.getTypeName().getSymbol();
      if (symbol === undefined) {
        return;
      }

      for (const declaration of symbol.getDeclarations()) {
        const declarationPath = toRelativePath(this.path, declaration.getSourceFile().getFilePath(), this.rootDir);
        if (Str.includes("node_modules")(declarationPath)) {
          continue;
        }

        const targetId = this.resolveTypeDeclarationId(declaration, declarationPath);
        if (targetId !== undefined && targetId !== sourceId && MutableHashMap.has(this.nodes, targetId)) {
          this.addEdge({
            source: sourceId,
            target: targetId,
            kind: "type_reference",
            label: typeName,
          });
        }
      }
    });
  }

  private resolveTypeDeclarationId(declaration: Node, filePath: string): string | undefined {
    if (Node.isClassDeclaration(declaration)) {
      return this.nodeId("class", filePath, declaration.getName() ?? "");
    }

    if (Node.isInterfaceDeclaration(declaration)) {
      return this.nodeId("interface", filePath, declaration.getName());
    }

    if (Node.isTypeAliasDeclaration(declaration)) {
      return this.nodeId("type_alias", filePath, declaration.getName());
    }

    if (Node.isEnumDeclaration(declaration)) {
      return this.nodeId("enum", filePath, declaration.getName());
    }

    return undefined;
  }

  private resolveDeclarationId(declaration: Node, filePath: string, fallbackName: string): O.Option<string> {
    if (Node.isFunctionDeclaration(declaration)) {
      const name = declaration.getName() ?? fallbackName;
      const candidates = [this.nodeId("function", filePath, name), this.nodeId("jsx_component", filePath, name)];

      for (const candidate of candidates) {
        if (MutableHashMap.has(this.nodes, candidate)) {
          return O.some(candidate);
        }
      }

      return O.none();
    }

    if (Node.isVariableDeclaration(declaration)) {
      const name = declaration.getName();
      const candidates = [
        this.nodeId("function", filePath, name),
        this.nodeId("jsx_component", filePath, name),
        this.nodeId("variable", filePath, name),
      ];

      for (const candidate of candidates) {
        if (MutableHashMap.has(this.nodes, candidate)) {
          return O.some(candidate);
        }
      }

      return O.none();
    }

    if (Node.isMethodDeclaration(declaration)) {
      const cls = declaration.getParentIfKind(SyntaxKind.ClassDeclaration);
      if (cls !== undefined) {
        return O.some(this.nodeId("method", filePath, `${cls.getName() ?? ""}.${declaration.getName()}`));
      }
    }

    if (Node.isMethodSignature(declaration)) {
      const iface = declaration.getParentIfKind(SyntaxKind.InterfaceDeclaration);
      if (iface !== undefined) {
        return O.some(this.nodeId("method", filePath, `${iface.getName()}.${declaration.getName()}`));
      }
    }

    return O.none();
  }

  private resolveAndLinkType(type: Type, sourceId: string, kind: EdgeKind): void {
    const rawSymbol = type.getAliasSymbol() ?? type.getSymbol();
    const symbol = rawSymbol?.getAliasedSymbol() ?? rawSymbol;
    let linked = false;

    if (symbol !== undefined) {
      for (const declaration of symbol.getDeclarations()) {
        const declarationPath = toRelativePath(this.path, declaration.getSourceFile().getFilePath(), this.rootDir);
        if (Str.includes("node_modules")(declarationPath)) {
          continue;
        }

        const targetId = this.resolveTypeDeclarationId(declaration, declarationPath);
        if (targetId !== undefined && targetId !== sourceId && MutableHashMap.has(this.nodes, targetId)) {
          linked = true;
          this.addEdge({
            source: sourceId,
            target: targetId,
            kind,
          });
        }
      }
    }

    if (!linked) {
      for (const label of extractTypeReferenceLabels(type.getText())) {
        for (const targetId of this.findNodeIdsByLabel(label, ["class", "interface", "type_alias", "enum"])) {
          if (targetId !== sourceId) {
            this.addEdge({
              source: sourceId,
              target: targetId,
              kind,
            });
          }
        }
      }
    }

    if (type.isUnion()) {
      for (const unionType of type.getUnionTypes()) {
        this.resolveAndLinkType(unionType, sourceId, kind);
      }
    }

    if (type.isIntersection()) {
      for (const intersectionType of type.getIntersectionTypes()) {
        this.resolveAndLinkType(intersectionType, sourceId, kind);
      }
    }

    for (const typeArgument of type.getTypeArguments()) {
      this.resolveAndLinkType(typeArgument, sourceId, kind);
    }
  }

  private extractSourceFileSymbols(file: SourceFile): void {
    const filePath = toRelativePath(this.path, file.getFilePath(), this.rootDir);
    if (Str.includes("node_modules")(filePath) || Str.endsWith(".d.ts")(filePath)) {
      return;
    }

    const fileId = this.fileNodeId(filePath);

    this.addNode({
      id: fileId,
      kind: "file",
      label: this.path.basename(filePath),
      filePath,
      line: 1,
      endline: file.getEndLineNumber(),
      exported: false,
      meta: {
        fullPath: filePath,
        lineCount: file.getEndLineNumber(),
        isTestFile: isTestFile(filePath),
      },
    });

    this.addPackageForFile(filePath);
    this.extractModuleDeclarations(file, filePath, fileId);

    for (const fn of file.getFunctions()) {
      this.extractFunctionNode(fn, filePath, fileId);
    }

    for (const statement of file.getVariableStatements()) {
      this.extractVariableStatementNode(statement, filePath, fileId);
    }

    for (const cls of file.getClasses()) {
      this.extractClassNode(cls, filePath, fileId);
    }

    for (const interfaceDeclaration of file.getInterfaces()) {
      this.extractInterfaceNode(interfaceDeclaration, filePath, fileId);
    }

    for (const typeAlias of file.getTypeAliases()) {
      this.extractTypeAliasNode(typeAlias, filePath, fileId);
    }

    for (const enumDeclaration of file.getEnums()) {
      this.extractEnumNode(enumDeclaration, filePath, fileId);
    }
  }

  private extractImports(file: SourceFile, filePath: string): void {
    for (const importDeclaration of file.getImportDeclarations()) {
      const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
      const resolved = importDeclaration.getModuleSpecifierSourceFile();
      if (resolved === undefined) {
        continue;
      }

      const targetFilePath = toRelativePath(this.path, resolved.getFilePath(), this.rootDir);
      if (Str.includes("node_modules")(targetFilePath)) {
        continue;
      }

      this.addEdge({
        source: this.fileNodeId(filePath),
        target: this.fileNodeId(targetFilePath),
        kind: "imports",
        label: moduleSpecifier,
      });

      for (const namedImport of importDeclaration.getNamedImports()) {
        const importedName = namedImport.getName();
        const targetSymbolId = this.resolveSymbolNodeId(targetFilePath, importedName);
        if (O.isSome(targetSymbolId)) {
          this.addEdge({
            source: this.fileNodeId(filePath),
            target: targetSymbolId.value,
            kind: "uses_type",
            label: namedImport.getAliasNode()?.getText() ?? importedName,
          });
        }
      }
    }
  }

  private extractReExports(file: SourceFile, filePath: string): void {
    for (const exportDeclaration of file.getExportDeclarations()) {
      const resolved = exportDeclaration.getModuleSpecifierSourceFile();
      if (resolved === undefined) {
        continue;
      }

      const targetFilePath = toRelativePath(this.path, resolved.getFilePath(), this.rootDir);
      if (Str.includes("node_modules")(targetFilePath)) {
        continue;
      }

      this.addEdge({
        source: this.fileNodeId(filePath),
        target: this.fileNodeId(targetFilePath),
        kind: "re_exports",
      });

      for (const namedExport of exportDeclaration.getNamedExports()) {
        const exportName = namedExport.getName();
        const targetSymbolId = this.resolveSymbolNodeId(targetFilePath, exportName);

        if (O.isSome(targetSymbolId)) {
          this.addEdge({
            source: this.fileNodeId(filePath),
            target: targetSymbolId.value,
            kind: "exports",
            label: namedExport.getAliasNode()?.getText() ?? exportName,
          });
        }
      }
    }
  }

  private extractInheritance(file: SourceFile, filePath: string): void {
    for (const cls of file.getClasses()) {
      const className = cls.getName();
      if (className === undefined) {
        continue;
      }

      const classId = this.nodeId("class", filePath, className);

      const baseClass = cls.getBaseClass();
      if (baseClass !== undefined) {
        const baseClassName = baseClass.getName() ?? "";
        const baseFilePath = toRelativePath(this.path, baseClass.getSourceFile().getFilePath(), this.rootDir);
        const baseClassId = this.nodeId("class", baseFilePath, baseClassName);

        if (MutableHashMap.has(this.nodes, classId) && MutableHashMap.has(this.nodes, baseClassId)) {
          this.addEdge({ source: classId, target: baseClassId, kind: "extends" });
        }
      }

      for (const implementation of cls.getImplements()) {
        const implementationExpression = implementation.getExpression();
        const implementationName = implementationExpression.getText();
        const implementationLookupName = toLookupLabel(implementationName);
        const rawSymbol = implementationExpression.getSymbol();
        const symbol = rawSymbol?.getAliasedSymbol() ?? rawSymbol;
        let linked = false;

        if (symbol !== undefined) {
          for (const declaration of symbol.getDeclarations()) {
            const declarationFilePath = toRelativePath(
              this.path,
              declaration.getSourceFile().getFilePath(),
              this.rootDir
            );
            if (Str.includes("node_modules")(declarationFilePath)) {
              continue;
            }

            const targetId = this.resolveTypeDeclarationId(declaration, declarationFilePath);
            if (targetId !== undefined && MutableHashMap.has(this.nodes, targetId)) {
              linked = true;
              this.addEdge({ source: classId, target: targetId, kind: "implements", label: implementationName });
            }
          }
        }

        if (!linked) {
          const targetId = this.resolveSymbolNodeId(filePath, implementationLookupName);
          if (O.isSome(targetId)) {
            linked = true;
            this.addEdge({ source: classId, target: targetId.value, kind: "implements", label: implementationName });
          }
        }

        if (!linked) {
          for (const fallbackTargetId of this.findNodeIdsByLabel(implementationLookupName, [
            "interface",
            "class",
            "type_alias",
          ])) {
            if (fallbackTargetId === classId) {
              continue;
            }

            this.addEdge({
              source: classId,
              target: fallbackTargetId,
              kind: "implements",
              label: implementationName,
            });
          }
        }
      }
    }

    for (const interfaceDeclaration of file.getInterfaces()) {
      const interfaceId = this.nodeId("interface", filePath, interfaceDeclaration.getName());

      for (const extendsType of interfaceDeclaration.getExtends()) {
        const expressionText = extendsType.getExpression().getText();
        const targetId = this.resolveSymbolNodeId(filePath, expressionText);

        if (O.isSome(targetId)) {
          this.addEdge({ source: interfaceId, target: targetId.value, kind: "extends" });
        }
      }
    }
  }

  private extractOverrides(file: SourceFile, filePath: string): void {
    for (const cls of file.getClasses()) {
      const className = cls.getName() ?? "";
      const baseClass = cls.getBaseClass();
      if (baseClass === undefined) {
        continue;
      }

      const baseClassName = baseClass.getName() ?? "";
      const baseFilePath = toRelativePath(this.path, baseClass.getSourceFile().getFilePath(), this.rootDir);
      const baseMethods = HashSet.fromIterable(baseClass.getMethods().map((method) => method.getName()));

      for (const method of cls.getMethods()) {
        const methodName = method.getName();
        if (!HashSet.has(baseMethods, methodName)) {
          continue;
        }

        const childId = this.nodeId("method", filePath, `${className}.${methodName}`);
        const baseId = this.nodeId("method", baseFilePath, `${baseClassName}.${methodName}`);

        if (MutableHashMap.has(this.nodes, childId) && MutableHashMap.has(this.nodes, baseId)) {
          this.addEdge({ source: childId, target: baseId, kind: "overrides" });
        }
      }
    }
  }

  private extractCallEdges(file: SourceFile, filePath: string): void {
    file.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }

      const callerId = this.findEnclosingSymbolId(node, filePath);
      if (O.isNone(callerId)) {
        return;
      }

      const expression = node.getExpression();
      const targetLabel = Node.isIdentifier(expression)
        ? expression.getText()
        : Node.isPropertyAccessExpression(expression)
          ? expression.getName()
          : undefined;

      if (targetLabel === undefined) {
        return;
      }

      const symbol = expression.getSymbol();
      if (symbol === undefined) {
        return;
      }

      for (const declaration of symbol.getDeclarations()) {
        const declarationFilePath = toRelativePath(this.path, declaration.getSourceFile().getFilePath(), this.rootDir);
        if (Str.includes("node_modules")(declarationFilePath)) {
          continue;
        }

        const targetId = this.resolveDeclarationId(declaration, declarationFilePath, targetLabel);

        if (O.isSome(targetId) && MutableHashMap.has(this.nodes, targetId.value) && targetId.value !== callerId.value) {
          this.addEdge({
            source: callerId.value,
            target: targetId.value,
            kind: isConditionalCall(node) ? "conditional_calls" : "calls",
            label: targetLabel,
          });
        }
      }
    });
  }

  private extractInstantiations(file: SourceFile, filePath: string): void {
    file.forEachDescendant((node) => {
      if (!Node.isNewExpression(node)) {
        return;
      }

      const callerId = this.findEnclosingSymbolId(node, filePath);
      if (O.isNone(callerId)) {
        return;
      }

      const symbol = node.getExpression().getSymbol();
      if (symbol === undefined) {
        return;
      }

      const fallbackClassName = node.getExpression().getText();

      for (const declaration of symbol.getDeclarations()) {
        if (!Node.isClassDeclaration(declaration)) {
          continue;
        }

        const declarationFilePath = toRelativePath(this.path, declaration.getSourceFile().getFilePath(), this.rootDir);
        if (Str.includes("node_modules")(declarationFilePath)) {
          continue;
        }

        const className = declaration.getName() ?? fallbackClassName;
        const classId = this.nodeId("class", declarationFilePath, className);

        if (MutableHashMap.has(this.nodes, classId)) {
          this.addEdge({ source: callerId.value, target: classId, kind: "instantiates", label: className });

          const constructorId = this.nodeId("constructor", declarationFilePath, `${className}.constructor`);
          if (MutableHashMap.has(this.nodes, constructorId)) {
            this.addEdge({ source: callerId.value, target: constructorId, kind: "calls", label: "constructor" });
          }
        }
      }
    });
  }

  private extractPropertyAccess(file: SourceFile, filePath: string): void {
    file.forEachDescendant((node) => {
      if (!Node.isPropertyAccessExpression(node)) {
        return;
      }

      const parent = node.getParent();
      if (parent !== undefined && Node.isCallExpression(parent) && parent.getExpression() === node) {
        return;
      }

      const accessorId = this.findEnclosingSymbolId(node, filePath);
      if (O.isNone(accessorId)) {
        return;
      }

      const propertyName = node.getName();
      const symbol = node.getNameNode().getSymbol();
      if (symbol === undefined) {
        return;
      }

      for (const declaration of symbol.getDeclarations()) {
        if (!Node.isPropertyDeclaration(declaration) && !Node.isPropertySignature(declaration)) {
          continue;
        }

        const declarationFilePath = toRelativePath(this.path, declaration.getSourceFile().getFilePath(), this.rootDir);
        if (Str.includes("node_modules")(declarationFilePath)) {
          continue;
        }

        const parentDeclaration = declaration.getParent();
        const ownerName = Node.isClassDeclaration(parentDeclaration)
          ? (parentDeclaration.getName() ?? "")
          : Node.isInterfaceDeclaration(parentDeclaration)
            ? parentDeclaration.getName()
            : "";

        if (ownerName.length === 0) {
          continue;
        }

        const propertyId = this.nodeId("property", declarationFilePath, `${ownerName}.${propertyName}`);
        if (!MutableHashMap.has(this.nodes, propertyId) || propertyId === accessorId.value) {
          continue;
        }

        const isWrite =
          parent !== undefined &&
          Node.isBinaryExpression(parent) &&
          parent.getLeft() === node &&
          parent.getOperatorToken().getKind() === SyntaxKind.EqualsToken;

        this.addEdge({
          source: accessorId.value,
          target: propertyId,
          kind: isWrite ? "writes_property" : "reads_property",
          label: propertyName,
        });
      }
    });
  }

  private extractThrows(file: SourceFile, filePath: string): void {
    file.forEachDescendant((node) => {
      if (!Node.isThrowStatement(node)) {
        return;
      }

      const throwerId = this.findEnclosingSymbolId(node, filePath);
      if (O.isNone(throwerId)) {
        return;
      }

      const expression = node.getExpression();
      if (expression !== undefined && Node.isNewExpression(expression)) {
        const errorName = expression.getExpression().getText();
        const symbol = expression.getExpression().getSymbol();

        if (symbol !== undefined) {
          let linked = false;

          for (const declaration of symbol.getDeclarations()) {
            if (!Node.isClassDeclaration(declaration)) {
              continue;
            }

            const declarationPath = toRelativePath(this.path, declaration.getSourceFile().getFilePath(), this.rootDir);
            const className = declaration.getName() ?? errorName;
            const classId = this.nodeId("class", declarationPath, className);

            if (MutableHashMap.has(this.nodes, classId)) {
              linked = true;
              this.addEdge({ source: throwerId.value, target: classId, kind: "throws", label: className });
            }
          }

          if (!linked) {
            this.addEdge({
              source: throwerId.value,
              target: throwerId.value,
              kind: "throws",
              label: errorName,
              meta: { errorType: errorName, external: true },
            });
          }

          return;
        }

        this.addEdge({
          source: throwerId.value,
          target: throwerId.value,
          kind: "throws",
          label: errorName,
          meta: { errorType: errorName },
        });

        return;
      }

      this.addEdge({
        source: throwerId.value,
        target: throwerId.value,
        kind: "throws",
        label: expression === undefined ? "unknown" : Str.slice(0, 50)(expression.getText()),
      });
    });
  }

  private extractReturnTypes(file: SourceFile, filePath: string): void {
    const processReturnType = (
      fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | FunctionExpression | GetAccessorDeclaration,
      sourceId: string
    ): void => {
      const returnType = fn.getReturnType();
      this.resolveAndLinkType(returnType, sourceId, "return_type");
    };

    for (const fn of file.getFunctions()) {
      const name = fn.getName() ?? `<anonymous:${fn.getStartLineNumber()}>`;
      const candidates = [this.nodeId("function", filePath, name), this.nodeId("jsx_component", filePath, name)];

      for (const candidate of candidates) {
        if (MutableHashMap.has(this.nodes, candidate)) {
          processReturnType(fn, candidate);
        }
      }
    }

    for (const cls of file.getClasses()) {
      const className = cls.getName() ?? "";

      for (const method of cls.getMethods()) {
        const methodId = this.nodeId("method", filePath, `${className}.${method.getName()}`);
        if (MutableHashMap.has(this.nodes, methodId)) {
          processReturnType(method, methodId);
        }
      }

      for (const getter of cls.getGetAccessors()) {
        const getterId = this.nodeId("getter", filePath, `${className}.get:${getter.getName()}`);
        if (MutableHashMap.has(this.nodes, getterId)) {
          processReturnType(getter, getterId);
        }
      }
    }

    for (const statement of file.getVariableStatements()) {
      for (const declaration of statement.getDeclarations()) {
        const initializer = declaration.getInitializer();
        if (
          initializer === undefined ||
          (!Node.isArrowFunction(initializer) && !Node.isFunctionExpression(initializer))
        ) {
          continue;
        }

        const name = declaration.getName();
        const candidates = [this.nodeId("function", filePath, name), this.nodeId("jsx_component", filePath, name)];
        for (const candidate of candidates) {
          if (MutableHashMap.has(this.nodes, candidate)) {
            processReturnType(initializer, candidate);
          }
        }
      }
    }
  }

  private extractGenericConstraints(file: SourceFile, filePath: string): void {
    const processTypeParams = (
      declaration:
        | ClassDeclaration
        | InterfaceDeclaration
        | FunctionDeclaration
        | MethodDeclaration
        | TypeAliasDeclaration,
      sourceId: string
    ): void => {
      for (const typeParameter of declaration.getTypeParameters()) {
        const constraint = typeParameter.getConstraint();
        if (constraint === undefined) {
          continue;
        }

        const constraintType = constraint.getType();
        const rawSymbol = constraintType.getAliasSymbol() ?? constraintType.getSymbol();
        const symbol = rawSymbol?.getAliasedSymbol() ?? rawSymbol;
        let linked = false;

        if (symbol !== undefined) {
          for (const constraintDeclaration of symbol.getDeclarations()) {
            const declarationPath = toRelativePath(
              this.path,
              constraintDeclaration.getSourceFile().getFilePath(),
              this.rootDir
            );
            if (Str.includes("node_modules")(declarationPath)) {
              continue;
            }

            const targetId = this.resolveTypeDeclarationId(constraintDeclaration, declarationPath);
            if (targetId !== undefined && targetId !== sourceId && MutableHashMap.has(this.nodes, targetId)) {
              linked = true;
              this.addEdge({
                source: sourceId,
                target: targetId,
                kind: "generic_constraint",
                label: typeParameter.getName(),
              });
            }
          }
        }

        if (!linked) {
          for (const label of extractTypeReferenceLabels(constraint.getText())) {
            for (const targetId of this.findNodeIdsByLabel(label, ["class", "interface", "type_alias", "enum"])) {
              if (targetId === sourceId) {
                continue;
              }

              this.addEdge({
                source: sourceId,
                target: targetId,
                kind: "generic_constraint",
                label: typeParameter.getName(),
              });
            }
          }
        }
      }
    };

    for (const cls of file.getClasses()) {
      const className = cls.getName() ?? "";
      const classId = this.nodeId("class", filePath, className);
      if (MutableHashMap.has(this.nodes, classId)) {
        processTypeParams(cls, classId);
      }

      for (const method of cls.getMethods()) {
        const methodId = this.nodeId("method", filePath, `${className}.${method.getName()}`);
        if (MutableHashMap.has(this.nodes, methodId)) {
          processTypeParams(method, methodId);
        }
      }
    }

    for (const interfaceDeclaration of file.getInterfaces()) {
      const interfaceId = this.nodeId("interface", filePath, interfaceDeclaration.getName());
      if (MutableHashMap.has(this.nodes, interfaceId)) {
        processTypeParams(interfaceDeclaration, interfaceId);
      }
    }

    for (const fn of file.getFunctions()) {
      const name = fn.getName() ?? "";
      const functionId = this.nodeId("function", filePath, name);
      if (MutableHashMap.has(this.nodes, functionId)) {
        processTypeParams(fn, functionId);
      }
    }

    for (const typeAlias of file.getTypeAliases()) {
      const typeAliasId = this.nodeId("type_alias", filePath, typeAlias.getName());
      if (MutableHashMap.has(this.nodes, typeAliasId)) {
        processTypeParams(typeAlias, typeAliasId);
      }
    }
  }

  private extractFunctionTypeReferences(file: SourceFile, filePath: string): void {
    const processSignature = (
      fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | ConstructorDeclaration,
      sourceId: string
    ): void => {
      for (const parameter of fn.getParameters()) {
        this.resolveAndLinkType(parameter.getType(), sourceId, "type_reference");
      }
    };

    for (const fn of file.getFunctions()) {
      const name = fn.getName() ?? `<anonymous:${fn.getStartLineNumber()}>`;
      const candidates = [this.nodeId("function", filePath, name), this.nodeId("jsx_component", filePath, name)];

      for (const candidate of candidates) {
        if (MutableHashMap.has(this.nodes, candidate)) {
          processSignature(fn, candidate);
        }
      }
    }

    for (const cls of file.getClasses()) {
      const className = cls.getName() ?? "";

      for (const method of cls.getMethods()) {
        const methodId = this.nodeId("method", filePath, `${className}.${method.getName()}`);
        if (MutableHashMap.has(this.nodes, methodId)) {
          processSignature(method, methodId);
        }
      }

      for (const constructorDeclaration of cls.getConstructors()) {
        const constructorId = this.nodeId("constructor", filePath, `${className}.constructor`);
        if (MutableHashMap.has(this.nodes, constructorId)) {
          processSignature(constructorDeclaration, constructorId);
        }
      }
    }
  }

  private extractDependencyRelationships(file: SourceFile): void {
    const filePath = toRelativePath(this.path, file.getFilePath(), this.rootDir);
    if (!MutableHashMap.has(this.nodes, this.fileNodeId(filePath))) {
      return;
    }

    this.extractImports(file, filePath);
    this.extractReExports(file, filePath);
    this.extractInheritance(file, filePath);
    this.extractOverrides(file, filePath);
    this.extractCallEdges(file, filePath);
    this.extractInstantiations(file, filePath);
    this.extractPropertyAccess(file, filePath);
    this.extractThrows(file, filePath);
    this.extractReturnTypes(file, filePath);
    this.extractGenericConstraints(file, filePath);
    this.extractFunctionTypeReferences(file, filePath);
  }

  private extractTestCoverage(sourceFiles: ReadonlyArray<SourceFile>): void {
    for (const testFile of sourceFiles) {
      const testFilePath = toRelativePath(this.path, testFile.getFilePath(), this.rootDir);
      if (!isTestFile(testFilePath) || !MutableHashMap.has(this.nodes, this.fileNodeId(testFilePath))) {
        continue;
      }

      for (const importDeclaration of testFile.getImportDeclarations()) {
        const resolved = importDeclaration.getModuleSpecifierSourceFile();
        if (resolved === undefined) {
          continue;
        }

        const targetFilePath = toRelativePath(this.path, resolved.getFilePath(), this.rootDir);
        if (Str.includes("node_modules")(targetFilePath) || isTestFile(targetFilePath)) {
          continue;
        }

        const testFileId = this.fileNodeId(testFilePath);
        const targetFileId = this.fileNodeId(targetFilePath);

        if (MutableHashMap.has(this.nodes, testFileId) && MutableHashMap.has(this.nodes, targetFileId)) {
          this.addEdge({ source: testFileId, target: targetFileId, kind: "test_covers" });
        }

        for (const namedImport of importDeclaration.getNamedImports()) {
          const importedName = namedImport.getName();
          const symbolId = this.resolveSymbolNodeId(targetFilePath, importedName);
          if (O.isSome(symbolId)) {
            this.addEdge({
              source: testFileId,
              target: symbolId.value,
              kind: "test_covers",
              label: importedName,
            });
          }
        }
      }
    }
  }

  extractFromProject(
    project: Project,
    includeTests: boolean
  ): Effect.Effect<typeof CodebaseGraph.Type, TsMorphExtractionError> {
    const run = Effect.fn(function* (builder: GraphBuilder, project: Project, includeTests: boolean) {
      const sourceFiles = pipe(
        project.getSourceFiles(),
        A.filter((sourceFile) => {
          const filePath = sourceFile.getFilePath();
          return !Str.includes("node_modules")(filePath) && !Str.endsWith(".d.ts")(filePath);
        })
      );

      for (const sourceFile of sourceFiles) {
        builder.extractSourceFileSymbols(sourceFile);
      }

      for (const sourceFile of sourceFiles) {
        builder.extractDependencyRelationships(sourceFile);
      }

      if (includeTests) {
        builder.extractTestCoverage(sourceFiles);
      }

      const encodedNodes: ReadonlyArray<EncodedGraphNode> = pipe(
        Array.from(MutableHashMap.values(builder.nodes)),
        A.sort(Order.mapInput(Order.String, (node: EncodedGraphNode) => node.id))
      );
      const encodedEdges: ReadonlyArray<EncodedGraphEdge> = pipe(
        Array.from(MutableHashMap.values(builder.edges)),
        A.sort(
          Order.mapInput(
            Order.String,
            (edge: EncodedGraphEdge) => `${edge.source}|${edge.target}|${edge.kind}|${edge.label ?? ""}`
          )
        )
      );

      const nodeKinds = pipe(
        encodedNodes,
        A.reduce(Object.create(null) as Record<string, number>, (accumulator, node) => {
          const current = accumulator[node.kind] ?? 0;
          accumulator[node.kind] = current + 1;
          return accumulator;
        })
      );

      const payload = {
        nodes: encodedNodes,
        edges: encodedEdges,
        meta: {
          extractedAt: new Date().toISOString(),
          fileCount: sourceFiles.length,
          nodeCount: encodedNodes.length,
          edgeCount: encodedEdges.length,
          rootDir: normalizePath(builder.rootDir),
          nodeKinds,
          nodeKindCounts: nodeKinds,
        },
      };

      return yield* S.decodeUnknownEffect(CodebaseGraph)(payload).pipe(
        Effect.mapError(
          (cause) =>
            new TsMorphExtractionError({
              message: "Failed to decode extracted codebase graph payload.",
              cause,
            })
        )
      );
    });
    return run(this, project, includeTests);
  }
}

/**
 * Extract a codebase graph from a pre-built ts-morph runtime context.
 *
 * @param context - Runtime project context.
 * @param includeTests - Whether test coverage relationships should be emitted.
 * @returns Extracted `CodebaseGraph` payload.
 * @category Uncategorized
 * @since 0.0.0
 */
export const extractCodebaseGraphFromContext: (
  context: TsMorphProjectContext,
  includeTests: boolean
) => Effect.Effect<typeof CodebaseGraph.Type, TsMorphExtractionError, Path.Path> = Effect.fn(
  function* (context, includeTests) {
    const path = yield* Path.Path;
    const rootDir = path.dirname(context.scope.rootTsConfigPath);
    const workspace = path.basename(rootDir);
    const builder = new GraphBuilder(path, rootDir, workspace, context.scope.idMode);
    return yield* builder.extractFromProject(context.project, includeTests);
  }
);
