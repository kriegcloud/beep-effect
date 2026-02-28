/**
 * Codebase Graph Extractor — Exhaustive Edition
 *
 * Uses ts-morph to parse a TypeScript project and emit a comprehensive JSON
 * graph capturing every meaningful symbol and relationship.
 *
 * Usage:
 *   npx tsx extract-graph.ts --tsconfig ./path/to/tsconfig.json
 *   npx tsx extract-graph.ts --tsconfig ./path/to/tsconfig.json --out graph.json
 *   npx tsx extract-graph.ts --tsconfig ./path/to/tsconfig.json --packages ./pnpm-workspace.yaml
 */

import {
  Project,
  SourceFile,
  SyntaxKind,
  Node,
  FunctionDeclaration,
  MethodDeclaration,
  ClassDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  EnumDeclaration,
  CallExpression,
  ArrowFunction,
  VariableDeclaration,
  VariableStatement,
  PropertyDeclaration,
  PropertySignature,
  GetAccessorDeclaration,
  SetAccessorDeclaration,
  ConstructorDeclaration,
  ParameterDeclaration,
  NewExpression,
  TypeReferenceNode,
  ExportDeclaration,
  ExportSpecifier,
  Decorator,
  PropertyAccessExpression,
  ts,
  Scope,
} from "ts-morph";
import * as path from "path";
import * as fs from "fs";

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeKind =
  | "package"
  | "file"
  | "namespace"
  | "class"
  | "interface"
  | "type_alias"
  | "enum"
  | "enum_member"
  | "function"
  | "method"
  | "constructor"
  | "getter"
  | "setter"
  | "property"
  | "parameter"
  | "variable"
  | "decorator"
  | "jsx_component"
  | "module_declaration";

type EdgeKind =
  | "imports"
  | "re_exports"
  | "calls"
  | "instantiates"
  | "extends"
  | "implements"
  | "overrides"
  | "contains"
  | "has_method"
  | "has_constructor"
  | "has_property"
  | "has_getter"
  | "has_setter"
  | "has_parameter"
  | "has_member"
  | "type_reference"
  | "return_type"
  | "generic_constraint"
  | "reads_property"
  | "writes_property"
  | "decorates"
  | "throws"
  | "conditional_calls"
  | "test_covers"
  | "uses_type"
  | "exports";

interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  filePath: string;
  line: number;
  endLine: number;
  exported: boolean;
  meta?: Record<string, unknown>;
}

interface GraphEdge {
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
  meta?: Record<string, unknown>;
}

interface CodebaseGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: {
    extractedAt: string;
    fileCount: number;
    nodeCount: number;
    edgeCount: number;
    rootDir: string;
    nodeKinds: Record<string, number>;
    edgeKinds: Record<string, number>;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(kind: string, filePath: string, name: string): string {
  return `${kind}::${filePath}::${name}`;
}

function fileId(filePath: string): string {
  return `file::${filePath}`;
}

function pkgId(name: string): string {
  return `package::${name}`;
}

function relPath(absPath: string, rootDir: string): string {
  return path.relative(rootDir, absPath).replace(/\\/g, "/");
}

function isNodeExported(node: Node): boolean {
  if (Node.isExportable(node)) return node.isExported();
  return false;
}

function getParamSig(
  fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | ConstructorDeclaration
): string {
  try {
    return fn
      .getParameters()
      .map((p) => {
        const name = p.getName();
        const type = p.getType().getText(p);
        return `${name}: ${type}`;
      })
      .join(", ");
  } catch {
    return "";
  }
}

function getRetType(
  fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | GetAccessorDeclaration
): string {
  try {
    return fn.getReturnType().getText(fn);
  } catch {
    return "unknown";
  }
}

function endLine(node: Node): number {
  try {
    return node.getEndLineNumber();
  } catch {
    return 0;
  }
}

function isInsideConditional(node: Node): boolean {
  let current = node.getParent();
  while (current) {
    const kind = current.getKind();
    if (
      kind === SyntaxKind.IfStatement ||
      kind === SyntaxKind.ConditionalExpression ||
      kind === SyntaxKind.TryStatement ||
      kind === SyntaxKind.CatchClause ||
      kind === SyntaxKind.SwitchStatement
    ) {
      return true;
    }
    // Stop at function boundaries
    if (
      kind === SyntaxKind.FunctionDeclaration ||
      kind === SyntaxKind.MethodDeclaration ||
      kind === SyntaxKind.ArrowFunction ||
      kind === SyntaxKind.Constructor
    ) {
      return false;
    }
    current = current.getParent();
  }
  return false;
}

/** Heuristic: is this a React functional component? */
function isJsxComponent(decl: VariableDeclaration | FunctionDeclaration): boolean {
  try {
    const retType = decl.getType().getText(decl);
    if (
      retType.includes("JSX.Element") ||
      retType.includes("ReactElement") ||
      retType.includes("ReactNode")
    ) {
      return true;
    }
    // Check if function body contains JSX
    const body = decl.getDescendantsOfKind(SyntaxKind.JsxElement);
    const selfClosing = decl.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    return body.length > 0 || selfClosing.length > 0;
  } catch {
    return false;
  }
}

/** Heuristic: detect test files */
function isTestFile(fp: string): boolean {
  return (
    fp.includes(".test.") ||
    fp.includes(".spec.") ||
    fp.includes("__tests__/") ||
    fp.includes("__test__/")
  );
}

// ─── Package Discovery ────────────────────────────────────────────────────────

interface PackageInfo {
  name: string;
  dir: string; // relative to rootDir
  dependencies: string[];
  devDependencies: string[];
}

function discoverPackages(rootDir: string, workspaceFile?: string): PackageInfo[] {
  const packages: PackageInfo[] = [];

  // Try to find workspace packages from pnpm-workspace.yaml, package.json workspaces, etc.
  const rootPkg = path.join(rootDir, "package.json");
  if (fs.existsSync(rootPkg)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(rootPkg, "utf-8"));

      // npm/yarn workspaces
      let globs: string[] = [];
      if (Array.isArray(pkg.workspaces)) {
        globs = pkg.workspaces;
      } else if (pkg.workspaces?.packages) {
        globs = pkg.workspaces.packages;
      }

      if (globs.length > 0) {
        for (const glob of globs) {
          const base = glob.replace(/\/\*$/, "").replace(/\*$/, "");
          const searchDir = path.join(rootDir, base);
          if (fs.existsSync(searchDir) && fs.statSync(searchDir).isDirectory()) {
            for (const entry of fs.readdirSync(searchDir)) {
              const pkgJson = path.join(searchDir, entry, "package.json");
              if (fs.existsSync(pkgJson)) {
                try {
                  const p = JSON.parse(fs.readFileSync(pkgJson, "utf-8"));
                  packages.push({
                    name: p.name || entry,
                    dir: relPath(path.join(searchDir, entry), rootDir),
                    dependencies: Object.keys(p.dependencies || {}),
                    devDependencies: Object.keys(p.devDependencies || {}),
                  });
                } catch {}
              }
            }
          }
        }
      }

      // If no workspaces found, treat root as a single package
      if (packages.length === 0) {
        packages.push({
          name: pkg.name || path.basename(rootDir),
          dir: ".",
          dependencies: Object.keys(pkg.dependencies || {}),
          devDependencies: Object.keys(pkg.devDependencies || {}),
        });
      }
    } catch {}
  }

  return packages;
}

// ─── Extractor ────────────────────────────────────────────────────────────────

class CodebaseGraphExtractor {
  private project: Project;
  private rootDir: string;
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];
  private edgeSet = new Set<string>();
  private processedFiles = new Set<string>();
  private packages: PackageInfo[] = [];

  // Lookup maps for cross-referencing
  private classParentMap = new Map<string, string>(); // classId → parentClassId
  private fileToPackage = new Map<string, string>(); // filePath → packageName

  constructor(tsconfigPath: string) {
    this.project = new Project({
      tsConfigFilePath: tsconfigPath,
      skipAddingFilesFromTsConfig: false,
    });
    this.rootDir = path.dirname(path.resolve(tsconfigPath));
  }

  extract(): CodebaseGraph {
    const sourceFiles = this.project.getSourceFiles().filter((sf) => {
      const fp = sf.getFilePath();
      return !fp.includes("node_modules") && !fp.endsWith(".d.ts");
    });

    console.log(`Parsing ${sourceFiles.length} source files...`);

    // Phase 0: Discover packages
    this.packages = discoverPackages(this.rootDir);
    if (this.packages.length > 0) {
      console.log(`Found ${this.packages.length} packages`);
    }
    this.buildPackageNodes();
    this.mapFilesToPackages(sourceFiles);

    // Phase 1: Extract all symbols (nodes)
    for (const sf of sourceFiles) {
      this.extractFileSymbols(sf);
    }

    // Phase 2: Resolve relationships (edges)
    for (const sf of sourceFiles) {
      this.extractRelationships(sf);
    }

    // Phase 3: Test coverage mapping
    this.extractTestCoverage(sourceFiles);

    const nodeKinds: Record<string, number> = Object.create(null);
    this.nodes.forEach((n) => (nodeKinds[n.kind] = (nodeKinds[n.kind] || 0) + 1));
    const edgeKinds: Record<string, number> = Object.create(null);
    this.edges.forEach((e) => (edgeKinds[e.kind] = (edgeKinds[e.kind] || 0) + 1));

    console.log(`Graph: ${this.nodes.size} nodes, ${this.edges.length} edges`);
    console.log(`  Nodes:`, nodeKinds);
    console.log(`  Edges:`, edgeKinds);

    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      meta: {
        extractedAt: new Date().toISOString(),
        fileCount: sourceFiles.length,
        nodeCount: this.nodes.size,
        edgeCount: this.edges.length,
        rootDir: this.rootDir,
        nodeKinds,
        edgeKinds,
      },
    };
  }

  // ── Phase 0: Packages ─────────────────────────────────────────────────────

  private buildPackageNodes(): void {
    for (const pkg of this.packages) {
      this.addNode({
        id: pkgId(pkg.name),
        label: pkg.name,
        kind: "package",
        filePath: pkg.dir,
        line: 0,
        endLine: 0,
        exported: true,
        meta: {
          dir: pkg.dir,
          dependencyCount: pkg.dependencies.length,
          devDependencyCount: pkg.devDependencies.length,
        },
      });
    }
  }

  private mapFilesToPackages(sourceFiles: SourceFile[]): void {
    for (const sf of sourceFiles) {
      const fp = relPath(sf.getFilePath(), this.rootDir);
      for (const pkg of this.packages) {
        if (fp.startsWith(pkg.dir + "/") || pkg.dir === ".") {
          this.fileToPackage.set(fp, pkg.name);
          break;
        }
      }
    }
  }

  // ── Phase 1: Symbol Extraction ────────────────────────────────────────────

  private extractFileSymbols(sf: SourceFile): void {
    const fp = relPath(sf.getFilePath(), this.rootDir);
    if (this.processedFiles.has(fp)) return;
    this.processedFiles.add(fp);

    // File node
    this.addNode({
      id: fileId(fp),
      label: path.basename(fp),
      kind: "file",
      filePath: fp,
      line: 1,
      endLine: sf.getEndLineNumber(),
      exported: false,
      meta: {
        fullPath: fp,
        lineCount: sf.getEndLineNumber(),
        isTestFile: isTestFile(fp),
        isBarrelFile: this.isBarrelFile(sf),
        directory: path.dirname(fp),
      },
    });

    // Connect file to package
    const pkgName = this.fileToPackage.get(fp);
    if (pkgName) {
      this.addEdge(pkgId(pkgName), fileId(fp), "contains");
    }

    // Module declarations (declare module "..." { })
    for (const mod of sf.getModules()) {
      const name = mod.getName();
      const id = makeId("module_declaration", fp, name);
      this.addNode({
        id,
        label: name,
        kind: "module_declaration",
        filePath: fp,
        line: mod.getStartLineNumber(),
        endLine: endLine(mod),
        exported: isNodeExported(mod),
        meta: {
          isAmbient: mod.hasDeclareKeyword(),
          isNamespace: mod.getText().startsWith("namespace"),
        },
      });
      this.addEdge(fileId(fp), id, "contains");
    }

    // Namespaces
    // (ts-morph treats namespace and module declarations similarly)

    // Top-level functions
    for (const fn of sf.getFunctions()) {
      this.extractFunction(fn, fp, fileId(fp));
    }

    // Variable statements (arrow functions, constants, etc.)
    for (const vs of sf.getVariableStatements()) {
      this.extractVariableStatement(vs, fp, fileId(fp));
    }

    // Classes
    for (const cls of sf.getClasses()) {
      this.extractClass(cls, fp);
    }

    // Interfaces
    for (const iface of sf.getInterfaces()) {
      this.extractInterface(iface, fp);
    }

    // Type Aliases
    for (const ta of sf.getTypeAliases()) {
      this.extractTypeAlias(ta, fp);
    }

    // Enums
    for (const en of sf.getEnums()) {
      this.extractEnum(en, fp);
    }
  }

  private extractFunction(
    fn: FunctionDeclaration,
    fp: string,
    parentId: string
  ): void {
    const name = fn.getName() ?? `<anonymous:${fn.getStartLineNumber()}>`;
    const isComponent = isJsxComponent(fn);
    const kind: NodeKind = isComponent ? "jsx_component" : "function";
    const id = makeId(kind, fp, name);

    this.addNode({
      id,
      label: name,
      kind,
      filePath: fp,
      line: fn.getStartLineNumber(),
      endLine: endLine(fn),
      exported: isNodeExported(fn),
      meta: {
        params: getParamSig(fn),
        returnType: getRetType(fn),
        async: fn.isAsync(),
        generator: fn.isGenerator(),
        overloads: fn.getOverloads().length,
        parameterCount: fn.getParameters().length,
        typeParameterCount: fn.getTypeParameters().length,
      },
    });
    this.addEdge(parentId, id, "contains");

    // Extract parameters as nodes
    this.extractParameters(fn, fp, id);

    // Extract decorators
    this.extractDecorators(fn, fp, id);
  }

  private extractVariableStatement(
    vs: VariableStatement,
    fp: string,
    parentId: string
  ): void {
    for (const decl of vs.getDeclarations()) {
      const name = decl.getName();
      const initializer = decl.getInitializer();
      const isArrow = initializer?.getKind() === SyntaxKind.ArrowFunction;

      if (isArrow) {
        const arrow = initializer as ArrowFunction;
        const isComponent = isJsxComponent(decl);
        const kind: NodeKind = isComponent ? "jsx_component" : "function";
        const id = makeId(kind, fp, name);

        this.addNode({
          id,
          label: name,
          kind,
          filePath: fp,
          line: decl.getStartLineNumber(),
          endLine: endLine(decl),
          exported: isNodeExported(vs),
          meta: {
            params: getParamSig(arrow),
            returnType: getRetType(arrow),
            arrow: true,
            async: arrow.isAsync(),
            parameterCount: arrow.getParameters().length,
            typeParameterCount: arrow.getTypeParameters().length,
          },
        });
        this.addEdge(parentId, id, "contains");
        this.extractParameters(arrow, fp, id);
      } else {
        const id = makeId("variable", fp, name);
        let typeText = "";
        try {
          typeText = decl.getType().getText(decl);
        } catch {}

        this.addNode({
          id,
          label: name,
          kind: "variable",
          filePath: fp,
          line: decl.getStartLineNumber(),
          endLine: endLine(decl),
          exported: isNodeExported(vs),
          meta: {
            type: typeText,
            declarationKind: String(vs.getDeclarationKind()),
          },
        });
        this.addEdge(parentId, id, "contains");
      }
    }
  }

  private extractClass(cls: ClassDeclaration, fp: string): void {
    const name = cls.getName() ?? `<anonymous:${cls.getStartLineNumber()}>`;
    const id = makeId("class", fp, name);

    this.addNode({
      id,
      label: name,
      kind: "class",
      filePath: fp,
      line: cls.getStartLineNumber(),
      endLine: endLine(cls),
      exported: isNodeExported(cls),
      meta: {
        abstract: cls.isAbstract(),
        methodCount: cls.getMethods().length,
        propertyCount: cls.getProperties().length,
        constructorCount: cls.getConstructors().length,
        getterCount: cls.getGetAccessors().length,
        setterCount: cls.getSetAccessors().length,
        typeParameterCount: cls.getTypeParameters().length,
        staticMethodCount: cls.getMethods().filter((m) => m.isStatic()).length,
        implementsCount: cls.getImplements().length,
      },
    });
    this.addEdge(fileId(fp), id, "contains");

    // Decorators on the class
    this.extractDecorators(cls, fp, id);

    // Constructor
    for (const ctor of cls.getConstructors()) {
      this.extractConstructor(ctor, fp, name, id);
    }

    // Methods
    for (const method of cls.getMethods()) {
      this.extractMethod(method, fp, name, id);
    }

    // Properties
    for (const prop of cls.getProperties()) {
      this.extractProperty(prop, fp, name, id);
    }

    // Getters
    for (const getter of cls.getGetAccessors()) {
      this.extractGetter(getter, fp, name, id);
    }

    // Setters
    for (const setter of cls.getSetAccessors()) {
      this.extractSetter(setter, fp, name, id);
    }
  }

  private extractConstructor(
    ctor: ConstructorDeclaration,
    fp: string,
    className: string,
    classId: string
  ): void {
    const id = makeId("constructor", fp, `${className}.constructor`);

    // Parameter properties (e.g., constructor(private readonly userService: UserService))
    const paramProps = ctor
      .getParameters()
      .filter((p) => p.getScope() !== undefined || p.isReadonly());

    this.addNode({
      id,
      label: `${className}.constructor`,
      kind: "constructor",
      filePath: fp,
      line: ctor.getStartLineNumber(),
      endLine: endLine(ctor),
      exported: false,
      meta: {
        className,
        params: getParamSig(ctor),
        parameterCount: ctor.getParameters().length,
        parameterPropertyCount: paramProps.length,
        overloads: ctor.getOverloads().length,
      },
    });
    this.addEdge(classId, id, "has_constructor");

    // Extract parameters
    this.extractParameters(ctor, fp, id);

    // Parameter properties also create implicit property nodes
    for (const pp of paramProps) {
      const propName = pp.getName();
      const propId = makeId("property", fp, `${className}.${propName}`);
      let typeText = "";
      try {
        typeText = pp.getType().getText(pp);
      } catch {}

      if (!this.nodes.has(propId)) {
        this.addNode({
          id: propId,
          label: `${className}.${propName}`,
          kind: "property",
          filePath: fp,
          line: pp.getStartLineNumber(),
          endLine: endLine(pp),
          exported: false,
          meta: {
            className,
            type: typeText,
            visibility: pp.getScope() ?? "public",
            readonly: pp.isReadonly(),
            parameterProperty: true,
          },
        });
        this.addEdge(classId, propId, "has_property");
      }
    }
  }

  private extractMethod(
    method: MethodDeclaration,
    fp: string,
    className: string,
    classId: string
  ): void {
    const mName = method.getName();
    const id = makeId("method", fp, `${className}.${mName}`);

    this.addNode({
      id,
      label: `${className}.${mName}`,
      kind: "method",
      filePath: fp,
      line: method.getStartLineNumber(),
      endLine: endLine(method),
      exported: isNodeExported(method.getParentIfKindOrThrow(SyntaxKind.ClassDeclaration)),
      meta: {
        className,
        params: getParamSig(method),
        returnType: getRetType(method),
        static: method.isStatic(),
        async: method.isAsync(),
        abstract: method.isAbstract(),
        visibility: method.getScope() ?? "public",
        generator: method.isGenerator(),
        overloads: method.getOverloads().length,
        parameterCount: method.getParameters().length,
        typeParameterCount: method.getTypeParameters().length,
      },
    });
    this.addEdge(classId, id, "has_method");

    // Decorators
    this.extractDecorators(method, fp, id);

    // Parameters
    this.extractParameters(method, fp, id);
  }

  private extractProperty(
    prop: PropertyDeclaration,
    fp: string,
    className: string,
    classId: string
  ): void {
    const name = prop.getName();
    const id = makeId("property", fp, `${className}.${name}`);
    if (this.nodes.has(id)) return; // May already exist from constructor parameter property

    let typeText = "";
    try {
      typeText = prop.getType().getText(prop);
    } catch {}

    this.addNode({
      id,
      label: `${className}.${name}`,
      kind: "property",
      filePath: fp,
      line: prop.getStartLineNumber(),
      endLine: endLine(prop),
      exported: false,
      meta: {
        className,
        type: typeText,
        static: prop.isStatic(),
        readonly: prop.isReadonly(),
        abstract: prop.isAbstract(),
        optional: prop.hasQuestionToken(),
        visibility: prop.getScope() ?? "public",
        hasInitializer: prop.hasInitializer(),
      },
    });
    this.addEdge(classId, id, "has_property");

    // Decorators
    this.extractDecorators(prop, fp, id);
  }

  private extractGetter(
    getter: GetAccessorDeclaration,
    fp: string,
    className: string,
    classId: string
  ): void {
    const name = getter.getName();
    const id = makeId("getter", fp, `${className}.get:${name}`);

    this.addNode({
      id,
      label: `${className}.get ${name}`,
      kind: "getter",
      filePath: fp,
      line: getter.getStartLineNumber(),
      endLine: endLine(getter),
      exported: false,
      meta: {
        className,
        returnType: getRetType(getter),
        static: getter.isStatic(),
        visibility: getter.getScope() ?? "public",
      },
    });
    this.addEdge(classId, id, "has_getter");
    this.extractDecorators(getter, fp, id);
  }

  private extractSetter(
    setter: SetAccessorDeclaration,
    fp: string,
    className: string,
    classId: string
  ): void {
    const name = setter.getName();
    const id = makeId("setter", fp, `${className}.set:${name}`);

    let paramType = "";
    try {
      const param = setter.getParameters()[0];
      if (param) paramType = param.getType().getText(param);
    } catch {}

    this.addNode({
      id,
      label: `${className}.set ${name}`,
      kind: "setter",
      filePath: fp,
      line: setter.getStartLineNumber(),
      endLine: endLine(setter),
      exported: false,
      meta: {
        className,
        parameterType: paramType,
        static: setter.isStatic(),
        visibility: setter.getScope() ?? "public",
      },
    });
    this.addEdge(classId, id, "has_setter");
    this.extractDecorators(setter, fp, id);
  }

  private extractInterface(iface: InterfaceDeclaration, fp: string): void {
    const name = iface.getName();
    const id = makeId("interface", fp, name);

    this.addNode({
      id,
      label: name,
      kind: "interface",
      filePath: fp,
      line: iface.getStartLineNumber(),
      endLine: endLine(iface),
      exported: isNodeExported(iface),
      meta: {
        propertyCount: iface.getProperties().length,
        methodCount: iface.getMethods().length,
        typeParameterCount: iface.getTypeParameters().length,
        extendsCount: iface.getExtends().length,
        callSignatureCount: iface.getCallSignatures().length,
        indexSignatureCount: iface.getIndexSignatures().length,
      },
    });
    this.addEdge(fileId(fp), id, "contains");

    // Interface properties as nodes
    for (const prop of iface.getProperties()) {
      const propName = prop.getName();
      const propId = makeId("property", fp, `${name}.${propName}`);
      let typeText = "";
      try {
        typeText = prop.getType().getText(prop);
      } catch {}

      this.addNode({
        id: propId,
        label: `${name}.${propName}`,
        kind: "property",
        filePath: fp,
        line: prop.getStartLineNumber(),
        endLine: endLine(prop),
        exported: false,
        meta: {
          parentInterface: name,
          type: typeText,
          optional: prop.hasQuestionToken(),
          readonly: prop.isReadonly(),
        },
      });
      this.addEdge(id, propId, "has_property");
    }

    // Interface methods as nodes
    for (const method of iface.getMethods()) {
      const mName = method.getName();
      const mId = makeId("method", fp, `${name}.${mName}`);

      this.addNode({
        id: mId,
        label: `${name}.${mName}`,
        kind: "method",
        filePath: fp,
        line: method.getStartLineNumber(),
        endLine: endLine(method),
        exported: false,
        meta: {
          parentInterface: name,
          params: method
            .getParameters()
            .map((p) => `${p.getName()}: ${p.getType().getText(p)}`)
            .join(", "),
          returnType: method.getReturnType().getText(method),
          typeParameterCount: method.getTypeParameters().length,
        },
      });
      this.addEdge(id, mId, "has_method");
    }
  }

  private extractTypeAlias(ta: TypeAliasDeclaration, fp: string): void {
    const name = ta.getName();
    const id = makeId("type_alias", fp, name);
    let typeText = "";
    try {
      typeText = ta.getType().getText(ta);
    } catch {}

    this.addNode({
      id,
      label: name,
      kind: "type_alias",
      filePath: fp,
      line: ta.getStartLineNumber(),
      endLine: endLine(ta),
      exported: isNodeExported(ta),
      meta: {
        type: typeText,
        typeParameterCount: ta.getTypeParameters().length,
        isUnion: typeText.includes("|"),
        isIntersection: typeText.includes("&"),
      },
    });
    this.addEdge(fileId(fp), id, "contains");

    // Extract type references from the type alias definition
    this.extractTypeReferences(ta, fp, id);
  }

  private extractEnum(en: EnumDeclaration, fp: string): void {
    const name = en.getName();
    const id = makeId("enum", fp, name);

    this.addNode({
      id,
      label: name,
      kind: "enum",
      filePath: fp,
      line: en.getStartLineNumber(),
      endLine: endLine(en),
      exported: isNodeExported(en),
      meta: {
        memberCount: en.getMembers().length,
        isConst: en.isConstEnum(),
      },
    });
    this.addEdge(fileId(fp), id, "contains");

    // Enum members
    for (const member of en.getMembers()) {
      const mName = member.getName();
      const mId = makeId("enum_member", fp, `${name}.${mName}`);
      let value: string | number | undefined;
      try {
        value = member.getValue();
      } catch {}

      this.addNode({
        id: mId,
        label: `${name}.${mName}`,
        kind: "enum_member",
        filePath: fp,
        line: member.getStartLineNumber(),
        endLine: endLine(member),
        exported: false,
        meta: {
          parentEnum: name,
          value: value ?? undefined,
        },
      });
      this.addEdge(id, mId, "has_member");
    }
  }

  private extractParameters(
    fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | ConstructorDeclaration,
    fp: string,
    parentId: string
  ): void {
    for (const param of fn.getParameters()) {
      const name = param.getName();
      const id = makeId("parameter", fp, `${parentId.split("::").pop()}.${name}`);
      let typeText = "";
      try {
        typeText = param.getType().getText(param);
      } catch {}

      this.addNode({
        id,
        label: name,
        kind: "parameter",
        filePath: fp,
        line: param.getStartLineNumber(),
        endLine: endLine(param),
        exported: false,
        meta: {
          type: typeText,
          optional: param.isOptional(),
          rest: param.isRestParameter(),
          hasDefault: param.hasInitializer(),
          parameterProperty: param.getScope() !== undefined,
        },
      });
      this.addEdge(parentId, id, "has_parameter");

      // Type reference from parameter → type
      this.extractTypeReferences(param, fp, id);
    }
  }

  private extractDecorators(
    node: Node & { getDecorators?: () => Decorator[] },
    fp: string,
    parentId: string
  ): void {
    if (!node.getDecorators) return;

    for (const dec of node.getDecorators()) {
      const name = dec.getName();
      const id = makeId("decorator", fp, `${parentId.split("::").pop()}@${name}`);
      let args = "";
      try {
        args = dec
          .getArguments()
          .map((a) => a.getText())
          .join(", ");
      } catch {}

      this.addNode({
        id,
        label: `@${name}`,
        kind: "decorator",
        filePath: fp,
        line: dec.getStartLineNumber(),
        endLine: endLine(dec),
        exported: false,
        meta: {
          name,
          arguments: args || undefined,
        },
      });
      this.addEdge(id, parentId, "decorates");
    }
  }

  // ── Phase 2: Relationship Extraction ──────────────────────────────────────

  private extractRelationships(sf: SourceFile): void {
    const fp = relPath(sf.getFilePath(), this.rootDir);

    this.extractImports(sf, fp);
    this.extractReExports(sf, fp);
    this.extractInheritance(sf, fp);
    this.extractOverrides(sf, fp);
    this.extractCallEdges(sf, fp);
    this.extractInstantiations(sf, fp);
    this.extractPropertyAccess(sf, fp);
    this.extractThrows(sf, fp);
    this.extractReturnTypes(sf, fp);
    this.extractGenericConstraints(sf, fp);
    this.extractFunctionTypeReferences(sf, fp);
  }

  private extractImports(sf: SourceFile, fp: string): void {
    for (const imp of sf.getImportDeclarations()) {
      const moduleSpecifier = imp.getModuleSpecifierValue();
      try {
        const resolved = imp.getModuleSpecifierSourceFile();
        if (!resolved) continue;
        const targetFp = relPath(resolved.getFilePath(), this.rootDir);
        if (targetFp.includes("node_modules")) continue;

        // File → file import
        this.addEdge(fileId(fp), fileId(targetFp), "imports", moduleSpecifier);

        // Named imports → specific symbols
        for (const named of imp.getNamedImports()) {
          const importedName = named.getName();
          const alias = named.getAliasNode()?.getText();
          const targetSymbolId = this.findSymbolInFile(targetFp, importedName);
          if (targetSymbolId) {
            this.addEdge(fileId(fp), targetSymbolId, "imports", alias || importedName);
          }
        }

        // Default import
        const defaultImport = imp.getDefaultImport();
        if (defaultImport) {
          this.addEdge(fileId(fp), fileId(targetFp), "imports", "default");
        }

        // Namespace import (import * as X from ...)
        const nsImport = imp.getNamespaceImport();
        if (nsImport) {
          this.addEdge(fileId(fp), fileId(targetFp), "imports", `* as ${nsImport.getText()}`);
        }
      } catch {}
    }
  }

  private extractReExports(sf: SourceFile, fp: string): void {
    for (const exp of sf.getExportDeclarations()) {
      const moduleSpecifier = exp.getModuleSpecifierValue();
      if (!moduleSpecifier) continue;

      try {
        const resolved = exp.getModuleSpecifierSourceFile();
        if (!resolved) continue;
        const targetFp = relPath(resolved.getFilePath(), this.rootDir);
        if (targetFp.includes("node_modules")) continue;

        // Star re-export: export * from '...'
        if (exp.isNamespaceExport() || exp.getNamedExports().length === 0) {
          this.addEdge(fileId(fp), fileId(targetFp), "re_exports", `* from ${moduleSpecifier}`);
        }

        // Named re-exports
        for (const named of exp.getNamedExports()) {
          const name = named.getName();
          const alias = named.getAliasNode()?.getText();
          const targetSymbolId = this.findSymbolInFile(targetFp, name);

          if (targetSymbolId) {
            this.addEdge(fileId(fp), targetSymbolId, "re_exports", alias || name);
            this.addEdge(fileId(fp), targetSymbolId, "exports", alias || name);
          } else {
            this.addEdge(fileId(fp), fileId(targetFp), "re_exports", alias || name);
          }
        }
      } catch {}
    }

    // Direct exports (export { x, y } — without module specifier means local symbols)
    for (const exp of sf.getExportDeclarations()) {
      if (exp.getModuleSpecifierValue()) continue; // Already handled above

      for (const named of exp.getNamedExports()) {
        const name = named.getName();
        const symbolId = this.findSymbolInFile(fp, name);
        if (symbolId) {
          this.addEdge(fileId(fp), symbolId, "exports", name);
        }
      }
    }
  }

  private extractInheritance(sf: SourceFile, fp: string): void {
    // Class extends / implements
    for (const cls of sf.getClasses()) {
      const clsName = cls.getName() ?? `<anonymous:${cls.getStartLineNumber()}>`;
      const clsId = makeId("class", fp, clsName);

      // Extends
      const baseClass = cls.getBaseClass();
      if (baseClass) {
        const baseName = baseClass.getName() ?? "";
        const baseFp = relPath(baseClass.getSourceFile().getFilePath(), this.rootDir);
        const baseId = makeId("class", baseFp, baseName);
        if (this.nodes.has(baseId)) {
          this.addEdge(clsId, baseId, "extends");
          this.classParentMap.set(clsId, baseId);
        }
      }

      // Implements
      for (const impl of cls.getImplements()) {
        const implText = impl.getExpression().getText();
        const ifaceId = this.findNodeByLabelAndKind(implText, "interface");
        if (ifaceId) {
          this.addEdge(clsId, ifaceId, "implements");
        }
      }
    }

    // Interface extends
    for (const iface of sf.getInterfaces()) {
      const ifaceName = iface.getName();
      const ifaceId = makeId("interface", fp, ifaceName);

      for (const ext of iface.getBaseDeclarations()) {
        if (Node.isInterfaceDeclaration(ext)) {
          const extFp = relPath(ext.getSourceFile().getFilePath(), this.rootDir);
          const extId = makeId("interface", extFp, ext.getName());
          if (this.nodes.has(extId)) {
            this.addEdge(ifaceId, extId, "extends");
          }
        }
      }
    }
  }

  private extractOverrides(sf: SourceFile, fp: string): void {
    for (const cls of sf.getClasses()) {
      const clsName = cls.getName() ?? `<anonymous:${cls.getStartLineNumber()}>`;
      const clsId = makeId("class", fp, clsName);

      const baseClass = cls.getBaseClass();
      if (!baseClass) continue;

      const baseName = baseClass.getName() ?? "";
      const baseFp = relPath(baseClass.getSourceFile().getFilePath(), this.rootDir);
      const baseMethods = new Set(baseClass.getMethods().map((m) => m.getName()));

      for (const method of cls.getMethods()) {
        const mName = method.getName();
        if (baseMethods.has(mName)) {
          const childId = makeId("method", fp, `${clsName}.${mName}`);
          const parentId = makeId("method", baseFp, `${baseName}.${mName}`);
          if (this.nodes.has(childId) && this.nodes.has(parentId)) {
            this.addEdge(childId, parentId, "overrides");
          }
        }
      }

      // Check deeper inheritance chain (grandparent overrides)
      let ancestor = baseClass.getBaseClass();
      while (ancestor) {
        const ancName = ancestor.getName() ?? "";
        const ancFp = relPath(ancestor.getSourceFile().getFilePath(), this.rootDir);
        const ancMethods = new Set(ancestor.getMethods().map((m) => m.getName()));

        for (const method of cls.getMethods()) {
          const mName = method.getName();
          if (ancMethods.has(mName) && !baseMethods.has(mName)) {
            const childId = makeId("method", fp, `${clsName}.${mName}`);
            const parentId = makeId("method", ancFp, `${ancName}.${mName}`);
            if (this.nodes.has(childId) && this.nodes.has(parentId)) {
              this.addEdge(childId, parentId, "overrides");
            }
          }
        }

        ancestor = ancestor.getBaseClass();
      }
    }
  }

  private extractCallEdges(sf: SourceFile, fp: string): void {
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.CallExpression) return;

      const call = node as CallExpression;
      const callerId = this.findEnclosingSymbol(node, fp);
      if (!callerId) return;

      try {
        const expr = call.getExpression();
        let targetName: string | undefined;

        if (expr.getKind() === SyntaxKind.Identifier) {
          targetName = expr.getText();
        } else if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
          const propAccess = expr as PropertyAccessExpression;
          targetName = propAccess.getName();
        }

        if (!targetName) return;

        const symbol = call.getExpression().getSymbol();
        if (!symbol) return;

        for (const decl of symbol.getDeclarations()) {
          const declFile = decl.getSourceFile();
          const declFp = relPath(declFile.getFilePath(), this.rootDir);
          if (declFp.includes("node_modules")) continue;

          const targetId = this.resolveDeclarationId(decl, declFp, targetName);
          if (targetId && this.nodes.has(targetId) && callerId !== targetId) {
            const conditional = isInsideConditional(node);
            if (conditional) {
              this.addEdge(callerId, targetId, "conditional_calls", targetName);
            } else {
              this.addEdge(callerId, targetId, "calls", targetName);
            }
          }
        }
      } catch {}
    });
  }

  private extractInstantiations(sf: SourceFile, fp: string): void {
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.NewExpression) return;

      const newExpr = node as NewExpression;
      const callerId = this.findEnclosingSymbol(node, fp);
      if (!callerId) return;

      try {
        const exprText = newExpr.getExpression().getText();
        const symbol = newExpr.getExpression().getSymbol();
        if (!symbol) return;

        for (const decl of symbol.getDeclarations()) {
          const declFile = decl.getSourceFile();
          const declFp = relPath(declFile.getFilePath(), this.rootDir);
          if (declFp.includes("node_modules")) continue;

          if (Node.isClassDeclaration(decl)) {
            const className = decl.getName() ?? exprText;
            const classNodeId = makeId("class", declFp, className);
            if (this.nodes.has(classNodeId)) {
              this.addEdge(callerId, classNodeId, "instantiates", className);

              // Also link to constructor if it exists
              const ctorId = makeId("constructor", declFp, `${className}.constructor`);
              if (this.nodes.has(ctorId)) {
                this.addEdge(callerId, ctorId, "calls", "constructor");
              }
            }
          }
        }
      } catch {}
    });
  }

  private extractPropertyAccess(sf: SourceFile, fp: string): void {
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.PropertyAccessExpression) return;

      // Skip if this is the callee of a CallExpression (already handled)
      const parent = node.getParent();
      if (parent?.getKind() === SyntaxKind.CallExpression) {
        const callExpr = parent as CallExpression;
        if (callExpr.getExpression() === node) return;
      }

      const propAccess = node as PropertyAccessExpression;
      const accessorId = this.findEnclosingSymbol(node, fp);
      if (!accessorId) return;

      try {
        const propName = propAccess.getName();
        const symbol = propAccess.getNameNode().getSymbol();
        if (!symbol) return;

        for (const decl of symbol.getDeclarations()) {
          if (!Node.isPropertyDeclaration(decl) && !Node.isPropertySignature(decl)) continue;

          const declFile = decl.getSourceFile();
          const declFp = relPath(declFile.getFilePath(), this.rootDir);
          if (declFp.includes("node_modules")) continue;

          // Figure out the parent class/interface name
          const parentDecl = decl.getParent();
          let parentName = "";
          if (Node.isClassDeclaration(parentDecl)) {
            parentName = parentDecl.getName() ?? "";
          } else if (Node.isInterfaceDeclaration(parentDecl)) {
            parentName = parentDecl.getName();
          }

          if (!parentName) continue;

          const propId = makeId("property", declFp, `${parentName}.${propName}`);
          if (!this.nodes.has(propId) || accessorId === propId) continue;

          // Determine if this is a read or write
          const grandParent = parent?.getParent();
          const isWrite =
            parent?.getKind() === SyntaxKind.BinaryExpression &&
            (parent as any).getOperatorToken().getKind() === SyntaxKind.EqualsToken &&
            (parent as any).getLeft() === node;

          if (isWrite) {
            this.addEdge(accessorId, propId, "writes_property", propName);
          } else {
            this.addEdge(accessorId, propId, "reads_property", propName);
          }
        }
      } catch {}
    });
  }

  private extractThrows(sf: SourceFile, fp: string): void {
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.ThrowStatement) return;

      const throwerId = this.findEnclosingSymbol(node, fp);
      if (!throwerId) return;

      try {
        const throwExpr = node.getChildAtIndex(1); // The expression after 'throw'
        if (!throwExpr) return;

        // Check for 'throw new SomeError(...)'
        if (throwExpr.getKind() === SyntaxKind.NewExpression) {
          const newExpr = throwExpr as NewExpression;
          const errorName = newExpr.getExpression().getText();

          // Try to resolve to a class
          const symbol = newExpr.getExpression().getSymbol();
          if (symbol) {
            for (const decl of symbol.getDeclarations()) {
              const declFp = relPath(decl.getSourceFile().getFilePath(), this.rootDir);
              if (declFp.includes("node_modules")) {
                // Still record the throw, just with the name
                this.addEdge(throwerId, throwerId, "throws", errorName, {
                  errorType: errorName,
                  external: true,
                });
                continue;
              }
              if (Node.isClassDeclaration(decl)) {
                const className = decl.getName() ?? errorName;
                const classId = makeId("class", declFp, className);
                if (this.nodes.has(classId)) {
                  this.addEdge(throwerId, classId, "throws", errorName);
                }
              }
            }
          } else {
            // Unresolved — record as self-referencing with metadata
            this.addEdge(throwerId, throwerId, "throws", errorName, {
              errorType: errorName,
            });
          }
        } else {
          // throw someVariable or throw "string"
          const text = throwExpr.getText().substring(0, 50);
          this.addEdge(throwerId, throwerId, "throws", text, {
            errorType: "unknown",
            expression: text,
          });
        }
      } catch {}
    });
  }

  private extractReturnTypes(sf: SourceFile, fp: string): void {
    const processReturnType = (
      fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | GetAccessorDeclaration,
      fnId: string
    ) => {
      try {
        const returnType = fn.getReturnType();
        const typeNode = returnType.getSymbol();
        if (!typeNode) return;

        for (const decl of typeNode.getDeclarations()) {
          const declFp = relPath(decl.getSourceFile().getFilePath(), this.rootDir);
          if (declFp.includes("node_modules")) continue;

          const targetId = this.resolveTypeDeclarationId(decl, declFp);
          if (targetId && this.nodes.has(targetId)) {
            this.addEdge(fnId, targetId, "return_type");
          }
        }
      } catch {}
    };

    for (const fn of sf.getFunctions()) {
      const name = fn.getName() ?? `<anonymous:${fn.getStartLineNumber()}>`;
      const fnId = this.findNodeId("function", fp, name) || this.findNodeId("jsx_component", fp, name);
      if (fnId) processReturnType(fn, fnId);
    }

    for (const cls of sf.getClasses()) {
      const clsName = cls.getName() ?? "";
      for (const method of cls.getMethods()) {
        const mId = makeId("method", fp, `${clsName}.${method.getName()}`);
        if (this.nodes.has(mId)) processReturnType(method, mId);
      }
      for (const getter of cls.getGetAccessors()) {
        const gId = makeId("getter", fp, `${clsName}.get:${getter.getName()}`);
        if (this.nodes.has(gId)) processReturnType(getter, gId);
      }
    }
  }

  private extractGenericConstraints(sf: SourceFile, fp: string): void {
    const processTypeParams = (
      node: ClassDeclaration | InterfaceDeclaration | FunctionDeclaration | MethodDeclaration | TypeAliasDeclaration,
      nodeId: string
    ) => {
      try {
        for (const tp of node.getTypeParameters()) {
          const constraint = tp.getConstraint();
          if (!constraint) continue;

          // Try to resolve the constraint type
          const constraintType = constraint.getType();
          const symbol = constraintType.getSymbol();
          if (!symbol) continue;

          for (const decl of symbol.getDeclarations()) {
            const declFp = relPath(decl.getSourceFile().getFilePath(), this.rootDir);
            if (declFp.includes("node_modules")) continue;

            const targetId = this.resolveTypeDeclarationId(decl, declFp);
            if (targetId && this.nodes.has(targetId)) {
              this.addEdge(nodeId, targetId, "generic_constraint", tp.getName());
            }
          }
        }
      } catch {}
    };

    for (const cls of sf.getClasses()) {
      const name = cls.getName() ?? "";
      const id = makeId("class", fp, name);
      if (this.nodes.has(id)) processTypeParams(cls, id);

      for (const method of cls.getMethods()) {
        const mId = makeId("method", fp, `${name}.${method.getName()}`);
        if (this.nodes.has(mId)) processTypeParams(method, mId);
      }
    }

    for (const iface of sf.getInterfaces()) {
      const id = makeId("interface", fp, iface.getName());
      if (this.nodes.has(id)) processTypeParams(iface, id);
    }

    for (const fn of sf.getFunctions()) {
      const name = fn.getName() ?? "";
      const id = this.findNodeId("function", fp, name);
      if (id) processTypeParams(fn, id);
    }

    for (const ta of sf.getTypeAliases()) {
      const id = makeId("type_alias", fp, ta.getName());
      if (this.nodes.has(id)) processTypeParams(ta, id);
    }
  }

  private extractFunctionTypeReferences(sf: SourceFile, fp: string): void {
    // Walk functions/methods and extract type references from their signatures
    const processSignature = (
      fn: FunctionDeclaration | MethodDeclaration | ArrowFunction | ConstructorDeclaration,
      fnId: string
    ) => {
      for (const param of fn.getParameters()) {
        try {
          const paramType = param.getType();
          this.resolveAndLinkType(paramType, fp, fnId, "type_reference");
        } catch {}
      }
    };

    for (const fn of sf.getFunctions()) {
      const name = fn.getName() ?? `<anonymous:${fn.getStartLineNumber()}>`;
      const fnId = this.findNodeId("function", fp, name) || this.findNodeId("jsx_component", fp, name);
      if (fnId) processSignature(fn, fnId);
    }

    for (const cls of sf.getClasses()) {
      const clsName = cls.getName() ?? "";
      for (const method of cls.getMethods()) {
        const mId = makeId("method", fp, `${clsName}.${method.getName()}`);
        if (this.nodes.has(mId)) processSignature(method, mId);
      }
      for (const ctor of cls.getConstructors()) {
        const cId = makeId("constructor", fp, `${clsName}.constructor`);
        if (this.nodes.has(cId)) processSignature(ctor, cId);
      }
    }
  }

  private extractTypeReferences(node: Node, fp: string, sourceId: string): void {
    try {
      node.forEachDescendant((child) => {
        if (child.getKind() !== SyntaxKind.TypeReference) return;

        const typeRef = child as TypeReferenceNode;
        const typeName = typeRef.getTypeName().getText();

        try {
          const symbol = typeRef.getTypeName().getSymbol();
          if (!symbol) return;

          for (const decl of symbol.getDeclarations()) {
            const declFp = relPath(decl.getSourceFile().getFilePath(), this.rootDir);
            if (declFp.includes("node_modules")) return;

            const targetId = this.resolveTypeDeclarationId(decl, declFp);
            if (targetId && this.nodes.has(targetId) && targetId !== sourceId) {
              this.addEdge(sourceId, targetId, "type_reference", typeName);
            }
          }
        } catch {}
      });
    } catch {}
  }

  // ── Phase 3: Test Coverage ────────────────────────────────────────────────

  private extractTestCoverage(sourceFiles: SourceFile[]): void {
    const testFiles = sourceFiles.filter((sf) => {
      const fp = relPath(sf.getFilePath(), this.rootDir);
      return isTestFile(fp);
    });

    for (const tf of testFiles) {
      const tfp = relPath(tf.getFilePath(), this.rootDir);

      // Look at imports to determine what's being tested
      for (const imp of tf.getImportDeclarations()) {
        try {
          const resolved = imp.getModuleSpecifierSourceFile();
          if (!resolved) continue;
          const targetFp = relPath(resolved.getFilePath(), this.rootDir);
          if (targetFp.includes("node_modules") || isTestFile(targetFp)) continue;

          // File-level test coverage
          this.addEdge(fileId(tfp), fileId(targetFp), "test_covers");

          // Symbol-level test coverage
          for (const named of imp.getNamedImports()) {
            const importedName = named.getName();
            const targetId = this.findSymbolInFile(targetFp, importedName);
            if (targetId) {
              this.addEdge(fileId(tfp), targetId, "test_covers", importedName);
            }
          }
        } catch {}
      }
    }
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  private findEnclosingSymbol(node: Node, fp: string): string | undefined {
    let current = node.getParent();
    while (current) {
      if (Node.isFunctionDeclaration(current)) {
        const name = current.getName() ?? `<anonymous:${current.getStartLineNumber()}>`;
        return this.findNodeId("function", fp, name) || this.findNodeId("jsx_component", fp, name);
      }
      if (Node.isMethodDeclaration(current)) {
        const cls = current.getParentIfKind(SyntaxKind.ClassDeclaration);
        const clsName = cls?.getName() ?? "";
        return makeId("method", fp, `${clsName}.${current.getName()}`);
      }
      if (Node.isConstructorDeclaration(current)) {
        const cls = current.getParentIfKind(SyntaxKind.ClassDeclaration);
        const clsName = cls?.getName() ?? "";
        return makeId("constructor", fp, `${clsName}.constructor`);
      }
      if (Node.isGetAccessorDeclaration(current)) {
        const cls = current.getParentIfKind(SyntaxKind.ClassDeclaration);
        const clsName = cls?.getName() ?? "";
        return makeId("getter", fp, `${clsName}.get:${current.getName()}`);
      }
      if (Node.isSetAccessorDeclaration(current)) {
        const cls = current.getParentIfKind(SyntaxKind.ClassDeclaration);
        const clsName = cls?.getName() ?? "";
        return makeId("setter", fp, `${clsName}.set:${current.getName()}`);
      }
      if (Node.isArrowFunction(current)) {
        const varDecl = current.getParentIfKind(SyntaxKind.VariableDeclaration);
        if (varDecl) {
          const name = varDecl.getName();
          return this.findNodeId("function", fp, name) || this.findNodeId("jsx_component", fp, name);
        }
      }
      current = current.getParent();
    }
    return undefined;
  }

  private resolveDeclarationId(decl: Node, declFp: string, fallbackName: string): string | undefined {
    if (Node.isFunctionDeclaration(decl)) {
      const name = decl.getName() ?? fallbackName;
      return this.findNodeId("function", declFp, name) || this.findNodeId("jsx_component", declFp, name);
    }
    if (Node.isVariableDeclaration(decl)) {
      const name = decl.getName();
      return (
        this.findNodeId("function", declFp, name) ||
        this.findNodeId("jsx_component", declFp, name) ||
        this.findNodeId("variable", declFp, name)
      );
    }
    if (Node.isMethodDeclaration(decl)) {
      const cls = decl.getParentIfKind(SyntaxKind.ClassDeclaration);
      if (cls) {
        return makeId("method", declFp, `${cls.getName() ?? ""}.${decl.getName()}`);
      }
    }
    if (Node.isMethodSignature(decl)) {
      const iface = decl.getParentIfKind(SyntaxKind.InterfaceDeclaration);
      if (iface) {
        return makeId("method", declFp, `${iface.getName()}.${decl.getName()}`);
      }
    }
    return undefined;
  }

  private resolveTypeDeclarationId(decl: Node, declFp: string): string | undefined {
    if (Node.isClassDeclaration(decl)) {
      return makeId("class", declFp, decl.getName() ?? "");
    }
    if (Node.isInterfaceDeclaration(decl)) {
      return makeId("interface", declFp, decl.getName());
    }
    if (Node.isTypeAliasDeclaration(decl)) {
      return makeId("type_alias", declFp, decl.getName());
    }
    if (Node.isEnumDeclaration(decl)) {
      return makeId("enum", declFp, decl.getName());
    }
    return undefined;
  }

  private resolveAndLinkType(
    type: import("ts-morph").Type,
    fp: string,
    sourceId: string,
    edgeKind: EdgeKind
  ): void {
    try {
      const symbol = type.getSymbol() || type.getAliasSymbol();
      if (!symbol) return;

      for (const decl of symbol.getDeclarations()) {
        const declFp = relPath(decl.getSourceFile().getFilePath(), this.rootDir);
        if (declFp.includes("node_modules")) continue;

        const targetId = this.resolveTypeDeclarationId(decl, declFp);
        if (targetId && this.nodes.has(targetId) && targetId !== sourceId) {
          this.addEdge(sourceId, targetId, edgeKind);
        }
      }

      // Handle union/intersection types
      if (type.isUnion()) {
        for (const unionType of type.getUnionTypes()) {
          this.resolveAndLinkType(unionType, fp, sourceId, edgeKind);
        }
      }
      if (type.isIntersection()) {
        for (const interType of type.getIntersectionTypes()) {
          this.resolveAndLinkType(interType, fp, sourceId, edgeKind);
        }
      }

      // Handle generic type arguments (e.g., Promise<User> → link to User)
      for (const typeArg of type.getTypeArguments()) {
        this.resolveAndLinkType(typeArg, fp, sourceId, edgeKind);
      }
    } catch {}
  }

  private findSymbolInFile(filePath: string, name: string): string | undefined {
    for (const kind of [
      "function",
      "jsx_component",
      "class",
      "interface",
      "type_alias",
      "enum",
      "variable",
    ]) {
      const id = makeId(kind, filePath, name);
      if (this.nodes.has(id)) return id;
    }
    return undefined;
  }

  private findNodeByLabelAndKind(label: string, kind: NodeKind): string | undefined {
    for (const [id, node] of this.nodes) {
      if (node.label === label && node.kind === kind) return id;
    }
    return undefined;
  }

  private findNodeId(kind: string, fp: string, name: string): string | undefined {
    const id = makeId(kind, fp, name);
    return this.nodes.has(id) ? id : undefined;
  }

  private isBarrelFile(sf: SourceFile): boolean {
    const exports = sf.getExportDeclarations();
    const statements = sf.getStatements();
    // A barrel file is mostly re-exports
    return exports.length > 0 && exports.length >= statements.length * 0.7;
  }

  private addNode(node: GraphNode): void {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  private addEdge(
    source: string,
    target: string,
    kind: EdgeKind,
    label?: string,
    meta?: Record<string, unknown>
  ): void {
    const key = `${source}→${target}→${kind}`;
    if (this.edgeSet.has(key)) return;
    this.edgeSet.add(key);
    this.edges.push({ source, target, kind, label, meta });
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  let tsconfigPath = "./tsconfig.json";
  let outputPath = "codebase-graph.json";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tsconfig" && args[i + 1]) {
      tsconfigPath = args[++i];
    } else if (args[i] === "--out" && args[i + 1]) {
      outputPath = args[++i];
    } else if (args[i] === "--help") {
      console.log(`
Codebase Graph Extractor — Exhaustive Edition

Usage:
  npx tsx extract-graph.ts [options]

Options:
  --tsconfig <path>   Path to tsconfig.json (default: ./tsconfig.json)
  --out <path>        Output JSON file (default: codebase-graph.json)
  --help              Show this help

Node Kinds:
  package, file, namespace, class, interface, type_alias, enum, enum_member,
  function, method, constructor, getter, setter, property, parameter,
  variable, decorator, jsx_component, module_declaration

Edge Kinds:
  imports, re_exports, exports, calls, conditional_calls, instantiates,
  extends, implements, overrides, contains, has_method, has_constructor,
  has_property, has_getter, has_setter, has_parameter, has_member,
  type_reference, return_type, generic_constraint, reads_property,
  writes_property, decorates, throws, test_covers, uses_type
      `);
      process.exit(0);
    }
  }

  if (!fs.existsSync(tsconfigPath)) {
    console.error(`tsconfig not found: ${tsconfigPath}`);
    process.exit(1);
  }

  console.log(`Extracting codebase graph from: ${tsconfigPath}`);
  const startTime = Date.now();
  const extractor = new CodebaseGraphExtractor(tsconfigPath);
  const graph = extractor.extract();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
  console.log(`Graph written to: ${outputPath} (${elapsed}s)`);
}

main();
