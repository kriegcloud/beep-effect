import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReservationMixin } from './Reservation.js';

export interface LodgingReservation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Reservation<D>, rdfine.RdfResource<D> {
  checkinTime: Date | undefined;
  checkoutTime: Date | undefined;
  lodgingUnitDescription: string | undefined;
  lodgingUnitType: string | undefined;
  lodgingUnitTypeTerm: Schema.QualitativeValue | undefined;
  numAdults: Schema.QuantitativeValue<D> | undefined;
  numAdultsLiteral: number | undefined;
  numChildren: Schema.QuantitativeValue<D> | undefined;
  numChildrenLiteral: number | undefined;
}

export function LodgingReservationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LodgingReservation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LodgingReservationClass extends ReservationMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    checkinTime: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    checkoutTime: Date | undefined;
    @rdfine.property.literal()
    lodgingUnitDescription: string | undefined;
    @rdfine.property.literal()
    lodgingUnitType: string | undefined;
    @rdfine.property({ path: schema.lodgingUnitType })
    lodgingUnitTypeTerm: Schema.QualitativeValue | undefined;
    @rdfine.property.resource()
    numAdults: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numAdults, type: Number })
    numAdultsLiteral: number | undefined;
    @rdfine.property.resource()
    numChildren: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numChildren, type: Number })
    numChildrenLiteral: number | undefined;
  }
  return LodgingReservationClass as any
}
LodgingReservationMixin.appliesTo = schema.LodgingReservation
LodgingReservationMixin.createFactory = (env: RdfineEnvironment) => createFactory<LodgingReservation>([ReservationMixin, LodgingReservationMixin], { types: [schema.LodgingReservation] }, env)
