import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FoodEstablishmentReservationMixin } from '../lib/FoodEstablishmentReservation.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ReservationMixin } from '../lib/Reservation.js';

export const FoodEstablishmentReservationBundle = [
  FoodEstablishmentReservationMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ReservationMixin as Mixin];
