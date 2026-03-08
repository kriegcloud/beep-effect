import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Owl from './index.js';

type OwlVocabulary = Vocabulary<typeof Owl>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    owl: OwlVocabulary;
  }
}

export class OwlFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.owl = this._initVocabulary(Owl)
  }
}
