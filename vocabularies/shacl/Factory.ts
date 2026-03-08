import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Sh from './index.js';

type ShVocabulary = Vocabulary<typeof Sh>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    sh: ShVocabulary;
  }
}

export class ShFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.sh = this._initVocabulary(Sh)
  }
}
