import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EducationalOrganizationMixin } from './EducationalOrganization.js';

export interface MiddleSchool<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EducationalOrganization<D>, rdfine.RdfResource<D> {
}

export function MiddleSchoolMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MiddleSchool & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MiddleSchoolClass extends EducationalOrganizationMixin(Resource) {
  }
  return MiddleSchoolClass as any
}
MiddleSchoolMixin.appliesTo = schema.MiddleSchool
MiddleSchoolMixin.createFactory = (env: RdfineEnvironment) => createFactory<MiddleSchool>([EducationalOrganizationMixin, MiddleSchoolMixin], { types: [schema.MiddleSchool] }, env)
