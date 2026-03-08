import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizationMixin } from './Organization.js';

export interface FundingScheme<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Organization<D>, rdfine.RdfResource<D> {
}

export function FundingSchemeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FundingScheme & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FundingSchemeClass extends OrganizationMixin(Resource) {
  }
  return FundingSchemeClass as any
}
FundingSchemeMixin.appliesTo = schema.FundingScheme
FundingSchemeMixin.createFactory = (env: RdfineEnvironment) => createFactory<FundingScheme>([OrganizationMixin, FundingSchemeMixin], { types: [schema.FundingScheme] }, env)
