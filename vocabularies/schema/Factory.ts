import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Schema from './index.js';

type SchemaVocabulary = Vocabulary<typeof Schema>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    schema: SchemaVocabulary;
  }
}

export class SchemaFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.schema = this._initVocabulary(Schema)
  }
}
