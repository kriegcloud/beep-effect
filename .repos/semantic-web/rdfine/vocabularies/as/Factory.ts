import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as As from './index.js';

type AsVocabulary = Vocabulary<typeof As>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    as: AsVocabulary;
  }
}

export class AsFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.as = this._initVocabulary(As)
  }
}
