import * as DocumentsDbSchema from "@beep/documents-tables/schema";
import { Db } from "@beep/shared-infra/Db";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const serviceEffect = Db.make({
  schema: DocumentsDbSchema,
});

export class DocumentsDb extends Context.Tag("@beep/documents-infra/DocumentsDb")<
  DocumentsDb,
  Db.Shape<typeof DocumentsDbSchema>
>() {
  static readonly Live: Layer.Layer<DocumentsDb, never, Db.SliceDbRequirements> = Layer.scoped(this, serviceEffect);
}

export const layer: Layer.Layer<DocumentsDb, never, Db.SliceDbRequirements> = DocumentsDb.Live;
