import type { UnsafeTypes } from "@beep/types";
import type * as Arbitrary from "effect/Arbitrary";
import type * as Pretty from "effect/Pretty";
import type * as AST from "effect/SchemaAST";
// todo delete this. Creates a tight coupling between rule layer and schema layer
export const SymbolAnnotationId = Symbol.for("@beep/rules/SymbolAnnotationId");

declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [SymbolAnnotationId]?: string;
    }
  }
}

export type DefaultAnnotations<A, TypeParameters extends ReadonlyArray<UnsafeTypes.UnsafeAny> = readonly []> = {
  readonly identifier?: AST.IdentifierAnnotation;
  readonly title: AST.TitleAnnotation;
  readonly description: AST.DescriptionAnnotation;
  readonly documentation?: AST.DocumentationAnnotation;
  readonly examples?: AST.ExamplesAnnotation<A>;
  readonly default?: AST.DefaultAnnotation<A>;
  readonly jsonSchema?: AST.JSONSchemaAnnotation;
  readonly message?: AST.MessageAnnotation;
  readonly schemaId?: AST.SchemaIdAnnotation;
  readonly arbitrary?: Arbitrary.ArbitraryAnnotation<A, TypeParameters>;
  readonly pretty?: Pretty.PrettyAnnotation<A, TypeParameters>;
  readonly equivalence?: AST.EquivalenceAnnotation<A, TypeParameters>;
  readonly concurrency?: AST.ConcurrencyAnnotation;
  readonly batching?: AST.BatchingAnnotation;
  readonly parseIssueTitle?: AST.ParseIssueTitleAnnotation;
  readonly parseOptions?: AST.ParseOptions;
  readonly decodingFallback?: AST.DecodingFallbackAnnotation<A>;
  readonly [SymbolAnnotationId]?: string;
};
