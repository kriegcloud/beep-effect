import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Remove<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function RemoveMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Remove & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class RemoveClass extends ActivityMixin(Resource) {
  }
  return RemoveClass as any
}
RemoveMixin.appliesTo = as.Remove
RemoveMixin.createFactory = (env: RdfineEnvironment) => createFactory<Remove>([ActivityMixin, RemoveMixin], { types: [as.Remove] }, env)
