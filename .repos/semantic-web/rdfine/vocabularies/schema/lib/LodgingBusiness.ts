import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface LodgingBusiness<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
  amenityFeature: Schema.LocationFeatureSpecification<D> | undefined;
  audience: Schema.Audience<D> | undefined;
  availableLanguage: Schema.Language<D> | undefined;
  availableLanguageLiteral: string | undefined;
  checkinTime: Date | undefined;
  checkoutTime: Date | undefined;
  numberOfRooms: Schema.QuantitativeValue<D> | undefined;
  numberOfRoomsLiteral: number | undefined;
  petsAllowed: boolean | string | undefined;
  starRating: Schema.Rating<D> | undefined;
}

export function LodgingBusinessMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LodgingBusiness & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LodgingBusinessClass extends LocalBusinessMixin(Resource) {
    @rdfine.property.resource()
    amenityFeature: Schema.LocationFeatureSpecification | undefined;
    @rdfine.property.resource()
    audience: Schema.Audience | undefined;
    @rdfine.property.resource()
    availableLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.availableLanguage })
    availableLanguageLiteral: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    checkinTime: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    checkoutTime: Date | undefined;
    @rdfine.property.resource()
    numberOfRooms: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfRooms, type: Number })
    numberOfRoomsLiteral: number | undefined;
    @rdfine.property.literal()
    petsAllowed: boolean | string | undefined;
    @rdfine.property.resource()
    starRating: Schema.Rating | undefined;
  }
  return LodgingBusinessClass as any
}
LodgingBusinessMixin.appliesTo = schema.LodgingBusiness
LodgingBusinessMixin.createFactory = (env: RdfineEnvironment) => createFactory<LodgingBusiness>([LocalBusinessMixin, LodgingBusinessMixin], { types: [schema.LodgingBusiness] }, env)
