import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface Consortium<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function ConsortiumMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Consortium & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ConsortiumClass extends OrganizationMixin(Resource) {
  }
  return ConsortiumClass as any
}
ConsortiumMixin.appliesTo = schema.Consortium
ConsortiumMixin.createFactory = (env: RdfineEnvironment) => createFactory<Consortium>([OrganizationMixin, ConsortiumMixin], { types: [schema.Consortium] }, env)
