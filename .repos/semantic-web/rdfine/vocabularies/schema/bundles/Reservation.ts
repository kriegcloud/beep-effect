import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';
import { ProgramMembershipMixin } from '../lib/ProgramMembership.js';
import { ReservationMixin } from '../lib/Reservation.js';
import { ThingMixin } from '../lib/Thing.js';
import { TicketMixin } from '../lib/Ticket.js';

export const ReservationBundle = [
  IntangibleMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PriceSpecificationMixin as Mixin,
  ProgramMembershipMixin as Mixin,
  ReservationMixin as Mixin,
  ThingMixin as Mixin,
  TicketMixin as Mixin];
