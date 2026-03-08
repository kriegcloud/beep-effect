import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Skos from './index.js';

type SkosVocabulary = Vocabulary<typeof Skos>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    skos: SkosVocabulary;
  }
}

export class SkosFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.skos = this._initVocabulary(Skos)
  }
}
