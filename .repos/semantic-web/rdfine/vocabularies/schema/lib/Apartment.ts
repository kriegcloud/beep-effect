import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AccommodationMixin } from './Accommodation.js';

export interface Apartment<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Accommodation<D>, rdfine.RdfResource<D> {
  numberOfRooms: Schema.QuantitativeValue<D> | undefined;
  numberOfRoomsLiteral: number | undefined;
  occupancy: Schema.QuantitativeValue<D> | undefined;
}

export function ApartmentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Apartment & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ApartmentClass extends AccommodationMixin(Resource) {
    @rdfine.property.resource()
    numberOfRooms: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfRooms, type: Number })
    numberOfRoomsLiteral: number | undefined;
    @rdfine.property.resource()
    occupancy: Schema.QuantitativeValue | undefined;
  }
  return ApartmentClass as any
}
ApartmentMixin.appliesTo = schema.Apartment
ApartmentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Apartment>([AccommodationMixin, ApartmentMixin], { types: [schema.Apartment] }, env)
