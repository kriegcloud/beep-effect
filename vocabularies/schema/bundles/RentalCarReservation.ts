import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PlaceMixin } from '../lib/Place.js';
import { RentalCarReservationMixin } from '../lib/RentalCarReservation.js';
import { ReservationMixin } from '../lib/Reservation.js';

export const RentalCarReservationBundle = [
  PlaceMixin as Mixin,
  RentalCarReservationMixin as Mixin,
  ReservationMixin as Mixin];
