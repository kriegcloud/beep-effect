import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PlaceMixin } from '../lib/Place.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ReservationMixin } from '../lib/Reservation.js';
import { TaxiReservationMixin } from '../lib/TaxiReservation.js';

export const TaxiReservationBundle = [
  PlaceMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ReservationMixin as Mixin,
  TaxiReservationMixin as Mixin];
