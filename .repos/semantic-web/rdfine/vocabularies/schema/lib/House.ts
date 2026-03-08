import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AccommodationMixin } from './Accommodation.js';

export interface House<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Accommodation<D>, rdfine.RdfResource<D> {
  numberOfRooms: Schema.QuantitativeValue<D> | undefined;
  numberOfRoomsLiteral: number | undefined;
}

export function HouseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<House & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HouseClass extends AccommodationMixin(Resource) {
    @rdfine.property.resource()
    numberOfRooms: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfRooms, type: Number })
    numberOfRoomsLiteral: number | undefined;
  }
  return HouseClass as any
}
HouseMixin.appliesTo = schema.House
HouseMixin.createFactory = (env: RdfineEnvironment) => createFactory<House>([AccommodationMixin, HouseMixin], { types: [schema.House] }, env)
