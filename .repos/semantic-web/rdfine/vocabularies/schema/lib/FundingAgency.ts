import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ProjectMixin } from './Project.js';

export interface FundingAgency<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Project<D>, rdfine.RdfResource<D> {
}

export function FundingAgencyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FundingAgency & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FundingAgencyClass extends ProjectMixin(Resource) {
  }
  return FundingAgencyClass as any
}
FundingAgencyMixin.appliesTo = schema.FundingAgency
FundingAgencyMixin.createFactory = (env: RdfineEnvironment) => createFactory<FundingAgency>([ProjectMixin, FundingAgencyMixin], { types: [schema.FundingAgency] }, env)
