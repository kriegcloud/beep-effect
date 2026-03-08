import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Reservation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  bookingAgent: Schema.Organization<D> | Schema.Person<D> | undefined;
  bookingTime: Date | undefined;
  broker: Schema.Organization<D> | Schema.Person<D> | undefined;
  modifiedTime: Date | undefined;
  priceCurrency: string | undefined;
  programMembershipUsed: Schema.ProgramMembership<D> | undefined;
  provider: Schema.Organization<D> | Schema.Person<D> | undefined;
  reservationFor: Schema.Thing<D> | undefined;
  reservationId: string | undefined;
  reservationStatus: Schema.ReservationStatusType | undefined;
  reservedTicket: Schema.Ticket<D> | undefined;
  totalPrice: Schema.PriceSpecification<D> | undefined;
  totalPriceLiteral: number | string | undefined;
  underName: Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function ReservationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Reservation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReservationClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    bookingAgent: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date })
    bookingTime: Date | undefined;
    @rdfine.property.resource()
    broker: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date })
    modifiedTime: Date | undefined;
    @rdfine.property.literal()
    priceCurrency: string | undefined;
    @rdfine.property.resource()
    programMembershipUsed: Schema.ProgramMembership | undefined;
    @rdfine.property.resource()
    provider: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    reservationFor: Schema.Thing | undefined;
    @rdfine.property.literal()
    reservationId: string | undefined;
    @rdfine.property()
    reservationStatus: Schema.ReservationStatusType | undefined;
    @rdfine.property.resource()
    reservedTicket: Schema.Ticket | undefined;
    @rdfine.property.resource()
    totalPrice: Schema.PriceSpecification | undefined;
    @rdfine.property.literal({ path: schema.totalPrice })
    totalPriceLiteral: number | string | undefined;
    @rdfine.property.resource()
    underName: Schema.Organization | Schema.Person | undefined;
  }
  return ReservationClass as any
}
ReservationMixin.appliesTo = schema.Reservation
ReservationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Reservation>([IntangibleMixin, ReservationMixin], { types: [schema.Reservation] }, env)
