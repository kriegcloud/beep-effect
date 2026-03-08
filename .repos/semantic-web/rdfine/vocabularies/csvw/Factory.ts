import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Csvw from './index.js';

type CsvwVocabulary = Vocabulary<typeof Csvw>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    csvw: CsvwVocabulary;
  }
}

export class CsvwFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.csvw = this._initVocabulary(Csvw)
  }
}
