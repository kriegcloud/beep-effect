import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ContributeMixin } from './Contribute.js';

export interface Create<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Contribute<D>, rdfine.RdfResource<D> {
}

export function CreateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Create & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class CreateClass extends ContributeMixin(Resource) {
  }
  return CreateClass as any
}
CreateMixin.appliesTo = prov.Create
CreateMixin.createFactory = (env: RdfineEnvironment) => createFactory<Create>([ContributeMixin, CreateMixin], { types: [prov.Create] }, env)
