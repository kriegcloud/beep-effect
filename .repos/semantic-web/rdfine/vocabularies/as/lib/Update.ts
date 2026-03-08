import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Update<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function UpdateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Update & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class UpdateClass extends ActivityMixin(Resource) {
  }
  return UpdateClass as any
}
UpdateMixin.appliesTo = as.Update
UpdateMixin.createFactory = (env: RdfineEnvironment) => createFactory<Update>([ActivityMixin, UpdateMixin], { types: [as.Update] }, env)
