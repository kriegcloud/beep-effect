import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Foaf from './index.js';

type FoafVocabulary = Vocabulary<typeof Foaf>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    foaf: FoafVocabulary;
  }
}

export class FoafFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.foaf = this._initVocabulary(Foaf)
  }
}
