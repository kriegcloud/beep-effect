import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Hydra from './index.js';

type HydraVocabulary = Vocabulary<typeof Hydra>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    hydra: HydraVocabulary;
  }
}

export class HydraFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.hydra = this._initVocabulary(Hydra)
  }
}
