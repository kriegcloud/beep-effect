import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface WorkersUnion<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function WorkersUnionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WorkersUnion & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WorkersUnionClass extends OrganizationMixin(Resource) {
  }
  return WorkersUnionClass as any
}
WorkersUnionMixin.appliesTo = schema.WorkersUnion
WorkersUnionMixin.createFactory = (env: RdfineEnvironment) => createFactory<WorkersUnion>([OrganizationMixin, WorkersUnionMixin], { types: [schema.WorkersUnion] }, env)
