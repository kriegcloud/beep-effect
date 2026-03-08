import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EducationalOrganizationMixin } from './EducationalOrganization.js';

export interface Preschool<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EducationalOrganization<D>, rdfine.RdfResource<D> {
}

export function PreschoolMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Preschool & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PreschoolClass extends EducationalOrganizationMixin(Resource) {
  }
  return PreschoolClass as any
}
PreschoolMixin.appliesTo = schema.Preschool
PreschoolMixin.createFactory = (env: RdfineEnvironment) => createFactory<Preschool>([EducationalOrganizationMixin, PreschoolMixin], { types: [schema.Preschool] }, env)
