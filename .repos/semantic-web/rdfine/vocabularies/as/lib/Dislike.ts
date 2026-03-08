import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Dislike<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function DislikeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Dislike & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class DislikeClass extends ActivityMixin(Resource) {
  }
  return DislikeClass as any
}
DislikeMixin.appliesTo = as.Dislike
DislikeMixin.createFactory = (env: RdfineEnvironment) => createFactory<Dislike>([ActivityMixin, DislikeMixin], { types: [as.Dislike] }, env)
