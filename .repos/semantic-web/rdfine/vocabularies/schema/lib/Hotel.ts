import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LodgingBusinessMixin } from './LodgingBusiness.js';

export interface Hotel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LodgingBusiness<D>, rdfine.RdfResource<D> {
}

export function HotelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Hotel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HotelClass extends LodgingBusinessMixin(Resource) {
  }
  return HotelClass as any
}
HotelMixin.appliesTo = schema.Hotel
HotelMixin.createFactory = (env: RdfineEnvironment) => createFactory<Hotel>([LodgingBusinessMixin, HotelMixin], { types: [schema.Hotel] }, env)
