import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Rico from './index.js';

type RicoVocabulary = Vocabulary<typeof Rico>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    rico: RicoVocabulary;
  }
}

export class RicoFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.rico = this._initVocabulary(Rico)
  }
}
