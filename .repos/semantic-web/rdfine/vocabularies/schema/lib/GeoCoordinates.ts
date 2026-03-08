import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface GeoCoordinates<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  address: Schema.PostalAddress<D> | undefined;
  addressCountry: Schema.Country<D> | undefined;
  addressCountryLiteral: string | undefined;
  addressLiteral: string | undefined;
  elevation: number | string | undefined;
  latitude: number | string | undefined;
  longitude: number | string | undefined;
  postalCode: string | undefined;
}

export function GeoCoordinatesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GeoCoordinates & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GeoCoordinatesClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    address: Schema.PostalAddress | undefined;
    @rdfine.property.resource()
    addressCountry: Schema.Country | undefined;
    @rdfine.property.literal({ path: schema.addressCountry })
    addressCountryLiteral: string | undefined;
    @rdfine.property.literal({ path: schema.address })
    addressLiteral: string | undefined;
    @rdfine.property.literal()
    elevation: number | string | undefined;
    @rdfine.property.literal()
    latitude: number | string | undefined;
    @rdfine.property.literal()
    longitude: number | string | undefined;
    @rdfine.property.literal()
    postalCode: string | undefined;
  }
  return GeoCoordinatesClass as any
}
GeoCoordinatesMixin.appliesTo = schema.GeoCoordinates
GeoCoordinatesMixin.createFactory = (env: RdfineEnvironment) => createFactory<GeoCoordinates>([StructuredValueMixin, GeoCoordinatesMixin], { types: [schema.GeoCoordinates] }, env)
