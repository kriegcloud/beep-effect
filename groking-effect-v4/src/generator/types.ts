export type ExportKind =
  | "class"
  | "const"
  | "enum"
  | "function"
  | "interface"
  | "namespace"
  | "reexport"
  | "type"
  | "var"
  | "let"

export interface GeneratedExportFile {
  readonly exportName: string
  readonly exportKind: ExportKind
  readonly sourceRelativePath: string
  readonly summary: string | undefined
  readonly exampleCode: string | undefined
  readonly filePath: string
}

export interface ModuleParseDiagnostics {
  readonly jscodeshiftParseOk: boolean
  readonly astExportCount: number
  readonly tsMorphExportCount: number
  readonly mergedExportCount: number
  readonly missingInTsMorph: ReadonlyArray<string>
  readonly missingInAst: ReadonlyArray<string>
  readonly parseError?: string
}

export interface GeneratedModuleResult {
  readonly packageName: string
  readonly moduleName: string
  readonly moduleSourcePath: string
  readonly moduleReadmePath: string
  readonly moduleSurfacePath: string
  readonly exportFiles: ReadonlyArray<GeneratedExportFile>
  readonly parserDiagnostics: ModuleParseDiagnostics
}

export interface CommonGenerateOptions {
  readonly effectSmolRoot: string
  readonly outputRoot: string
  readonly repoRoot: string
  readonly dryRun?: boolean
}

export interface GenerateModuleOptions extends CommonGenerateOptions {
  readonly packageName: string
  readonly moduleName: string
}

export interface GeneratePackageOptions extends CommonGenerateOptions {
  readonly packageName: string
}

export interface GenerateRepositoryOptions extends CommonGenerateOptions {
  readonly packageName?: string
  readonly manifestPath?: string
}

export interface GeneratedPackageResult {
  readonly packageName: string
  readonly moduleResults: ReadonlyArray<GeneratedModuleResult>
}

export interface BootstrapManifestModuleEntry {
  readonly moduleName: string
  readonly sourcePath: string
  readonly exportCount: number
  readonly parserDiagnostics: ModuleParseDiagnostics
}

export interface BootstrapManifestPackageEntry {
  readonly packageName: string
  readonly moduleCount: number
  readonly exportCount: number
  readonly modules: ReadonlyArray<BootstrapManifestModuleEntry>
}

export interface BootstrapManifest {
  readonly generatedAt: string
  readonly effectSmolRoot: string
  readonly outputRoot: string
  readonly packageCount: number
  readonly moduleCount: number
  readonly exportCount: number
  readonly packages: ReadonlyArray<BootstrapManifestPackageEntry>
}

export interface GeneratedRepositoryResult {
  readonly packageResults: ReadonlyArray<GeneratedPackageResult>
  readonly manifestPath: string
  readonly manifest: BootstrapManifest
}
