import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EducationalOrganizationMixin } from './EducationalOrganization.js';

export interface HighSchool<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EducationalOrganization<D>, rdfine.RdfResource<D> {
}

export function HighSchoolMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HighSchool & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HighSchoolClass extends EducationalOrganizationMixin(Resource) {
  }
  return HighSchoolClass as any
}
HighSchoolMixin.appliesTo = schema.HighSchool
HighSchoolMixin.createFactory = (env: RdfineEnvironment) => createFactory<HighSchool>([EducationalOrganizationMixin, HighSchoolMixin], { types: [schema.HighSchool] }, env)
