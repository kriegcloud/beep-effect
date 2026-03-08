import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LodgingReservationMixin } from '../lib/LodgingReservation.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ReservationMixin } from '../lib/Reservation.js';

export const LodgingReservationBundle = [
  LodgingReservationMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ReservationMixin as Mixin];
