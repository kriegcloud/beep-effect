import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ReservationMixin } from '../lib/Reservation.js';
import { TrainReservationMixin } from '../lib/TrainReservation.js';

export const TrainReservationBundle = [
  ReservationMixin as Mixin,
  TrainReservationMixin as Mixin];
