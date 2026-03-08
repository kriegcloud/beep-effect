import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EducationalOrganizationMixin } from './EducationalOrganization.js';

export interface CollegeOrUniversity<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EducationalOrganization<D>, rdfine.RdfResource<D> {
}

export function CollegeOrUniversityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CollegeOrUniversity & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CollegeOrUniversityClass extends EducationalOrganizationMixin(Resource) {
  }
  return CollegeOrUniversityClass as any
}
CollegeOrUniversityMixin.appliesTo = schema.CollegeOrUniversity
CollegeOrUniversityMixin.createFactory = (env: RdfineEnvironment) => createFactory<CollegeOrUniversity>([EducationalOrganizationMixin, CollegeOrUniversityMixin], { types: [schema.CollegeOrUniversity] }, env)
