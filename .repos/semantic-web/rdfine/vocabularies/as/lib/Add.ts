import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Add<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function AddMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Add & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class AddClass extends ActivityMixin(Resource) {
  }
  return AddClass as any
}
AddMixin.appliesTo = as.Add
AddMixin.createFactory = (env: RdfineEnvironment) => createFactory<Add>([ActivityMixin, AddMixin], { types: [as.Add] }, env)
