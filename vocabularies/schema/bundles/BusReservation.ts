import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BusReservationMixin } from '../lib/BusReservation.js';
import { ReservationMixin } from '../lib/Reservation.js';

export const BusReservationBundle = [
  BusReservationMixin as Mixin,
  ReservationMixin as Mixin];
