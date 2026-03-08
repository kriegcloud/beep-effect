import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';
import { SeatMixin } from '../lib/Seat.js';
import { TicketMixin } from '../lib/Ticket.js';

export const TicketBundle = [
  IntangibleMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PriceSpecificationMixin as Mixin,
  SeatMixin as Mixin,
  TicketMixin as Mixin];
