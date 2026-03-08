import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';
import { OrganizationMixin } from './Organization.js';

export interface EducationalOrganization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, Schema.Organization<D>, rdfine.RdfResource<D> {
  alumni: Schema.Person<D> | undefined;
}

export function EducationalOrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EducationalOrganization & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EducationalOrganizationClass extends OrganizationMixin(CivicStructureMixin(Resource)) {
    @rdfine.property.resource()
    alumni: Schema.Person | undefined;
  }
  return EducationalOrganizationClass as any
}
EducationalOrganizationMixin.appliesTo = schema.EducationalOrganization
EducationalOrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<EducationalOrganization>([OrganizationMixin, CivicStructureMixin, EducationalOrganizationMixin], { types: [schema.EducationalOrganization] }, env)
