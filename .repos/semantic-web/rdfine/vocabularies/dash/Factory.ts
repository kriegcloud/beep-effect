import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Dash from './index.js';

type DashVocabulary = Vocabulary<typeof Dash>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    dash: DashVocabulary;
  }
}

export class DashFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.dash = this._initVocabulary(Dash)
  }
}
