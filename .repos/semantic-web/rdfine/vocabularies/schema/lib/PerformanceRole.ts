import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { RoleMixin } from './Role.js';

export interface PerformanceRole<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Role<D>, rdfine.RdfResource<D> {
  characterName: string | undefined;
}

export function PerformanceRoleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PerformanceRole & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PerformanceRoleClass extends RoleMixin(Resource) {
    @rdfine.property.literal()
    characterName: string | undefined;
  }
  return PerformanceRoleClass as any
}
PerformanceRoleMixin.appliesTo = schema.PerformanceRole
PerformanceRoleMixin.createFactory = (env: RdfineEnvironment) => createFactory<PerformanceRole>([RoleMixin, PerformanceRoleMixin], { types: [schema.PerformanceRole] }, env)
