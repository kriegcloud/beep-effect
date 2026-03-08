import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FlightReservationMixin } from '../lib/FlightReservation.js';
import { ReservationMixin } from '../lib/Reservation.js';

export const FlightReservationBundle = [
  FlightReservationMixin as Mixin,
  ReservationMixin as Mixin];
