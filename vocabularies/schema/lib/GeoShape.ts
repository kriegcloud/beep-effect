import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface GeoShape<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  address: Schema.PostalAddress<D> | undefined;
  addressCountry: Schema.Country<D> | undefined;
  addressCountryLiteral: string | undefined;
  addressLiteral: string | undefined;
  box: string | undefined;
  circle: string | undefined;
  elevation: number | string | undefined;
  line: string | undefined;
  polygon: string | undefined;
  postalCode: string | undefined;
}

export function GeoShapeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GeoShape & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GeoShapeClass extends StructuredValueMixin(Resource) {
    @rdfine.property.resource()
    address: Schema.PostalAddress | undefined;
    @rdfine.property.resource()
    addressCountry: Schema.Country | undefined;
    @rdfine.property.literal({ path: schema.addressCountry })
    addressCountryLiteral: string | undefined;
    @rdfine.property.literal({ path: schema.address })
    addressLiteral: string | undefined;
    @rdfine.property.literal()
    box: string | undefined;
    @rdfine.property.literal()
    circle: string | undefined;
    @rdfine.property.literal()
    elevation: number | string | undefined;
    @rdfine.property.literal()
    line: string | undefined;
    @rdfine.property.literal()
    polygon: string | undefined;
    @rdfine.property.literal()
    postalCode: string | undefined;
  }
  return GeoShapeClass as any
}
GeoShapeMixin.appliesTo = schema.GeoShape
GeoShapeMixin.createFactory = (env: RdfineEnvironment) => createFactory<GeoShape>([StructuredValueMixin, GeoShapeMixin], { types: [schema.GeoShape] }, env)
