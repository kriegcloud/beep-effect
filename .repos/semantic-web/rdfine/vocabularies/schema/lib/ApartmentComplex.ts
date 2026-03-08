import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ResidenceMixin } from './Residence.js';

export interface ApartmentComplex<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Residence<D>, rdfine.RdfResource<D> {
  numberOfAccommodationUnits: Schema.QuantitativeValue<D> | undefined;
  numberOfAvailableAccommodationUnits: Schema.QuantitativeValue<D> | undefined;
  numberOfBedrooms: Schema.QuantitativeValue<D> | undefined;
  numberOfBedroomsLiteral: number | undefined;
  petsAllowed: boolean | string | undefined;
  tourBookingPage: RDF.NamedNode | undefined;
}

export function ApartmentComplexMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ApartmentComplex & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ApartmentComplexClass extends ResidenceMixin(Resource) {
    @rdfine.property.resource()
    numberOfAccommodationUnits: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    numberOfAvailableAccommodationUnits: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    numberOfBedrooms: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfBedrooms, type: Number })
    numberOfBedroomsLiteral: number | undefined;
    @rdfine.property.literal()
    petsAllowed: boolean | string | undefined;
    @rdfine.property()
    tourBookingPage: RDF.NamedNode | undefined;
  }
  return ApartmentComplexClass as any
}
ApartmentComplexMixin.appliesTo = schema.ApartmentComplex
ApartmentComplexMixin.createFactory = (env: RdfineEnvironment) => createFactory<ApartmentComplex>([ResidenceMixin, ApartmentComplexMixin], { types: [schema.ApartmentComplex] }, env)
