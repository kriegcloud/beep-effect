import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface PerformingGroup<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function PerformingGroupMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PerformingGroup & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PerformingGroupClass extends OrganizationMixin(Resource) {
  }
  return PerformingGroupClass as any
}
PerformingGroupMixin.appliesTo = schema.PerformingGroup
PerformingGroupMixin.createFactory = (env: RdfineEnvironment) => createFactory<PerformingGroup>([OrganizationMixin, PerformingGroupMixin], { types: [schema.PerformingGroup] }, env)
