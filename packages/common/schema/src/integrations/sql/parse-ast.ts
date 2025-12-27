import * as Schema from "effect/Schema";
import * as SchemaAST from "effect/SchemaAST";

export const DeclarationMetaSchema = Schema.instanceOf(SchemaAST.Declaration).annotations({
  identifier: "DeclarationMetaSchema",
  title: "Declaration Meta Schema.",
  description: "An effect schema representing the AST structure of an Schema.declare effect/Schema",
});

export declare namespace DeclarationMetaSchema {
  export type Type = typeof DeclarationMetaSchema.Type;
  export type Encoded = typeof DeclarationMetaSchema.Encoded;
}
