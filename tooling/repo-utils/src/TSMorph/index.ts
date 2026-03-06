import * as Model from "./TSMorph.model.js";
import * as Service from "./TSMorph.service.js";

/**
 * @since 0.0.0
 */
export type SymbolInit = Model.SymbolInit;
/**
 * @since 0.0.0
 */
export const ByteLength = Model.ByteLength;
/**
 * @since 0.0.0
 */
export const ByteOffset = Model.ByteOffset;
/**
 * @since 0.0.0
 */
export const ColumnNumber = Model.ColumnNumber;
/**
 * @since 0.0.0
 */
export const ContentHash = Model.ContentHash;
/**
 * @since 0.0.0
 */
export const ContentHashFromBytes = Model.ContentHashFromBytes;
/**
 * @since 0.0.0
 */
export const ContentHashFromSourceText = Model.ContentHashFromSourceText;
/**
 * @since 0.0.0
 */
export const FilePathToTsConfigFilePath = Model.FilePathToTsConfigFilePath;
/**
 * @since 0.0.0
 */
export const FilePathToTypeScriptDeclarationFilePath = Model.FilePathToTypeScriptDeclarationFilePath;
/**
 * @since 0.0.0
 */
export const FilePathToTypeScriptFilePath = Model.FilePathToTypeScriptFilePath;
/**
 * @since 0.0.0
 */
export const FilePathToTypeScriptImplementationFilePath = Model.FilePathToTypeScriptImplementationFilePath;
/**
 * @since 0.0.0
 */
export const LineNumber = Model.LineNumber;
/**
 * @since 0.0.0
 */
export const makeProjectCacheKey = Model.makeProjectCacheKey;
/**
 * @since 0.0.0
 */
export const makeProjectScopeId = Model.makeProjectScopeId;
/**
 * @since 0.0.0
 */
export const makeSymbol = Model.makeSymbol;
/**
 * @since 0.0.0
 */
export const makeSymbolId = Model.makeSymbolId;
/**
 * @since 0.0.0
 */
export const ProjectCacheKey = Model.ProjectCacheKey;
/**
 * @since 0.0.0
 */
export const ProjectScopeId = Model.ProjectScopeId;
/**
 * @since 0.0.0
 */
export const ProjectScopeIdParts = Model.ProjectScopeIdParts;
/**
 * @since 0.0.0
 */
export const RepoRootPath = Model.RepoRootPath;
/**
 * @since 0.0.0
 */
export const SourceText = Model.SourceText;
/**
 * @since 0.0.0
 */
export const Symbol = Model.Symbol;
/**
 * @since 0.0.0
 */
export const SymbolCategory = Model.SymbolCategory;
/**
 * @since 0.0.0
 */
export const SymbolFilePath = Model.SymbolFilePath;
/**
 * @since 0.0.0
 */
export const SymbolId = Model.SymbolId;
/**
 * @since 0.0.0
 */
export const SymbolIdParts = Model.SymbolIdParts;
/**
 * @since 0.0.0
 */
export const SymbolKind = Model.SymbolKind;
/**
 * @since 0.0.0
 */
export const SymbolKindToCategory = Model.SymbolKindToCategory;
/**
 * @since 0.0.0
 */
export const SymbolNameSegment = Model.SymbolNameSegment;
/**
 * @since 0.0.0
 */
export const SymbolQualifiedName = Model.SymbolQualifiedName;
/**
 * @since 0.0.0
 */
export const symbolCategoryFromKind = Model.symbolCategoryFromKind;
/**
 * @since 0.0.0
 */
export const TsConfigFilePath = Model.TsConfigFilePath;
/**
 * @since 0.0.0
 */
export const TsMorphDiagnostic = Model.TsMorphDiagnostic;
/**
 * @since 0.0.0
 */
export const TsMorphDiagnosticCategory = Model.TsMorphDiagnosticCategory;
/**
 * @since 0.0.0
 */
export const TsMorphDiagnosticsRequest = Model.TsMorphDiagnosticsRequest;
/**
 * @since 0.0.0
 */
export const TsMorphDiagnosticsResult = Model.TsMorphDiagnosticsResult;
/**
 * @since 0.0.0
 */
export const TsMorphFileOutline = Model.TsMorphFileOutline;
/**
 * @since 0.0.0
 */
export const TsMorphFileOutlineRequest = Model.TsMorphFileOutlineRequest;
/**
 * @since 0.0.0
 */
export const TsMorphProjectScope = Model.TsMorphProjectScope;
/**
 * @since 0.0.0
 */
export const TsMorphProjectScopeRequest = Model.TsMorphProjectScopeRequest;
/**
 * @since 0.0.0
 */
export const TsMorphReferencePolicy = Model.TsMorphReferencePolicy;
/**
 * @since 0.0.0
 */
export const TsMorphScopeEntrypoint = Model.TsMorphScopeEntrypoint;
/**
 * @since 0.0.0
 */
export const TsMorphScopeMode = Model.TsMorphScopeMode;
/**
 * @since 0.0.0
 */
export const TsMorphSearchLimit = Model.TsMorphSearchLimit;
/**
 * @since 0.0.0
 */
export const TsMorphSourceTextRequest = Model.TsMorphSourceTextRequest;
/**
 * @since 0.0.0
 */
export const TsMorphSourceTextResult = Model.TsMorphSourceTextResult;
/**
 * @since 0.0.0
 */
export const TsMorphSymbolLookupRequest = Model.TsMorphSymbolLookupRequest;
/**
 * @since 0.0.0
 */
export const TsMorphSymbolLookupResult = Model.TsMorphSymbolLookupResult;
/**
 * @since 0.0.0
 */
export const TsMorphSymbolSearchRequest = Model.TsMorphSymbolSearchRequest;
/**
 * @since 0.0.0
 */
export const TsMorphSymbolSearchResult = Model.TsMorphSymbolSearchResult;
/**
 * @since 0.0.0
 */
export const TsMorphSymbolSourceRequest = Model.TsMorphSymbolSourceRequest;
/**
 * @since 0.0.0
 */
export const TsMorphSymbolSourceResult = Model.TsMorphSymbolSourceResult;
/**
 * @since 0.0.0
 */
export const TypeScriptDeclarationFilePath = Model.TypeScriptDeclarationFilePath;
/**
 * @since 0.0.0
 */
export const TypeScriptFilePath = Model.TypeScriptFilePath;
/**
 * @since 0.0.0
 */
export const TypeScriptImplementationFilePath = Model.TypeScriptImplementationFilePath;
/**
 * @since 0.0.0
 */
export const TypeScriptImplementationFilePathToSymbolFilePath = Model.TypeScriptImplementationFilePathToSymbolFilePath;
/**
 * @since 0.0.0
 */
export const WorkspaceDirectoryPath = Model.WorkspaceDirectoryPath;
/**
 * @since 0.0.0
 */
export type TSMorphServiceError = Service.TSMorphServiceError;
/**
 * @since 0.0.0
 */
export type TSMorphServiceShape = Service.TSMorphServiceShape;
/**
 * @since 0.0.0
 */
export const createTSMorphService = Service.createTSMorphService;
/**
 * @since 0.0.0
 */
export const TSMorphService = Service.TSMorphService;
/**
 * @since 0.0.0
 */
export const TSMorphServiceLive = Service.TSMorphServiceLive;
/**
 * @since 0.0.0
 */
export const TsMorphServiceUnavailableError = Service.TsMorphServiceUnavailableError;
