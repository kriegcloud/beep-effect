import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Create<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function CreateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Create & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class CreateClass extends ActivityMixin(Resource) {
  }
  return CreateClass as any
}
CreateMixin.appliesTo = as.Create
CreateMixin.createFactory = (env: RdfineEnvironment) => createFactory<Create>([ActivityMixin, CreateMixin], { types: [as.Create] }, env)
