import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EducationalOrganizationMixin } from './EducationalOrganization.js';

export interface ElementarySchool<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EducationalOrganization<D>, rdfine.RdfResource<D> {
}

export function ElementarySchoolMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ElementarySchool & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ElementarySchoolClass extends EducationalOrganizationMixin(Resource) {
  }
  return ElementarySchoolClass as any
}
ElementarySchoolMixin.appliesTo = schema.ElementarySchool
ElementarySchoolMixin.createFactory = (env: RdfineEnvironment) => createFactory<ElementarySchool>([EducationalOrganizationMixin, ElementarySchoolMixin], { types: [schema.ElementarySchool] }, env)
