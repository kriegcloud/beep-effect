import * as AST from "effect/SchemaAST";
import * as S from "effect/Schema";
export const builtInAnnotations = {
  schemaId: AST.SchemaIdAnnotationId,
  message: AST.MessageAnnotationId,
  missingMessage: AST.MissingMessageAnnotationId,
  identifier: AST.IdentifierAnnotationId,
  title: AST.TitleAnnotationId,
  description: AST.DescriptionAnnotationId,
  examples: AST.ExamplesAnnotationId,
  default: AST.DefaultAnnotationId,
  documentation: AST.DocumentationAnnotationId,
  jsonSchema: AST.JSONSchemaAnnotationId,
  arbitrary: AST.ArbitraryAnnotationId,
  pretty: AST.PrettyAnnotationId,
  equivalence: AST.EquivalenceAnnotationId,
  concurrency: AST.ConcurrencyAnnotationId,
  batching: AST.BatchingAnnotationId,
  parseIssueTitle: AST.ParseIssueTitleAnnotationId,
  parseOptions: AST.ParseOptionsAnnotationId,
  decodingFallback: AST.DecodingFallbackAnnotationId,
} as const;

export interface AllAnnotations<A, TypeParameters extends ReadonlyArray<unknown>>
  extends S.Annotations.Schema<A, TypeParameters>,
    S.PropertySignature.Annotations<A> {}

export const toASTAnnotations = <A, TypeParameters extends ReadonlyArray<unknown>>(
  annotations?: AllAnnotations<A, TypeParameters>
): AST.Annotations => {
  if (!annotations) {
    return {};
  }
  const out: Record<symbol | string, unknown> = { ...annotations };

  for (const key in builtInAnnotations) {
    if (key in annotations) {
      const id = builtInAnnotations[key as keyof typeof builtInAnnotations];
      out[id] = annotations[key as keyof typeof annotations];
      delete out[key];
    }
  }

  return out;
};

/* <<<<<<<<<<<<<<  ✨ Windsurf Command ⭐ >>>>>>>>>>>>>>>> */
/**
 * Merges the given annotations with the AST annotations.
 *
 * @param ast - The AST to merge annotations into
 * @param annotations - The annotations to merge
 * @returns The AST with merged annotations
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
/* <<<<<<<<<<  0da96ba1-8e2a-449a-8f6f-e562046f45a2  >>>>>>>>>>> */
export const mergeSchemaAnnotations = <A>(ast: AST.AST, annotations: S.Annotations.Schema<A>): AST.AST =>
  AST.annotations(ast, toASTAnnotations(annotations));