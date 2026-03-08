import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { DocumentMixin } from './Document.js';

export interface Audio<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Document<D>, rdfine.RdfResource<D> {
}

export function AudioMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Audio & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class AudioClass extends DocumentMixin(Resource) {
  }
  return AudioClass as any
}
AudioMixin.appliesTo = as.Audio
AudioMixin.createFactory = (env: RdfineEnvironment) => createFactory<Audio>([DocumentMixin, AudioMixin], { types: [as.Audio] }, env)
