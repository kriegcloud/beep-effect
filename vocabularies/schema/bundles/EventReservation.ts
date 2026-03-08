import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventReservationMixin } from '../lib/EventReservation.js';
import { ReservationMixin } from '../lib/Reservation.js';

export const EventReservationBundle = [
  EventReservationMixin as Mixin,
  ReservationMixin as Mixin];
