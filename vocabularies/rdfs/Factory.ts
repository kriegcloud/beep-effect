import type { RdfineEnvironment, Vocabulary } from '@tpluscode/rdfine/environment';
import * as Rdfs from './index.js';

type RdfsVocabulary = Vocabulary<typeof Rdfs>;

declare module '@tpluscode/rdfine/environment' {
  interface Rdfine {
    rdfs: RdfsVocabulary;
  }
}

export class RdfsFactory {
  init(this: RdfineEnvironment) {
    this.rdfine.rdfs = this._initVocabulary(Rdfs)
  }
}
