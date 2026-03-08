import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Rdf from './index.js';

type RdfVocabulary = Vocabulary<typeof Rdf>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    rdf: RdfVocabulary;
  }
}

export class RdfFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.rdf = this._initVocabulary(Rdf)
  }
}
