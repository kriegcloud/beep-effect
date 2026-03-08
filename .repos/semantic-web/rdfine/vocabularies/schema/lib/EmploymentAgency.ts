import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface EmploymentAgency<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function EmploymentAgencyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EmploymentAgency & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EmploymentAgencyClass extends LocalBusinessMixin(Resource) {
  }
  return EmploymentAgencyClass as any
}
EmploymentAgencyMixin.appliesTo = schema.EmploymentAgency
EmploymentAgencyMixin.createFactory = (env: RdfineEnvironment) => createFactory<EmploymentAgency>([LocalBusinessMixin, EmploymentAgencyMixin], { types: [schema.EmploymentAgency] }, env)
