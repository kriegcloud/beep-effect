import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Wgs from './index.js';

type WgsVocabulary = Vocabulary<typeof Wgs>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    wgs: WgsVocabulary;
  }
}

export class WgsFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.wgs = this._initVocabulary(Wgs)
  }
}
