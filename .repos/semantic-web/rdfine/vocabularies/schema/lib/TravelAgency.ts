import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface TravelAgency<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function TravelAgencyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TravelAgency & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TravelAgencyClass extends LocalBusinessMixin(Resource) {
  }
  return TravelAgencyClass as any
}
TravelAgencyMixin.appliesTo = schema.TravelAgency
TravelAgencyMixin.createFactory = (env: RdfineEnvironment) => createFactory<TravelAgency>([LocalBusinessMixin, TravelAgencyMixin], { types: [schema.TravelAgency] }, env)
