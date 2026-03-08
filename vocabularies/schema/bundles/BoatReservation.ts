import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BoatReservationMixin } from '../lib/BoatReservation.js';
import { ReservationMixin } from '../lib/Reservation.js';

export const BoatReservationBundle = [
  BoatReservationMixin as Mixin,
  ReservationMixin as Mixin];
