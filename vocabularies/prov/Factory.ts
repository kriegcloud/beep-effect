import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Prov from './index.js';

type ProvVocabulary = Vocabulary<typeof Prov>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    prov: ProvVocabulary;
  }
}

export class ProvFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.prov = this._initVocabulary(Prov)
  }
}
