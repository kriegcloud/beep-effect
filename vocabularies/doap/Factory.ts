import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Doap from './index.js';

type DoapVocabulary = Vocabulary<typeof Doap>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    doap: DoapVocabulary;
  }
}

export class DoapFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.doap = this._initVocabulary(Doap)
  }
}
