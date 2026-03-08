import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Sioc from './index.js';

type SiocVocabulary = Vocabulary<typeof Sioc>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    sioc: SiocVocabulary;
  }
}

export class SiocFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.sioc = this._initVocabulary(Sioc)
  }
}
