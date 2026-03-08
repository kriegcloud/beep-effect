import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ReservationMixin } from '../lib/Reservation.js';
import { ReservationPackageMixin } from '../lib/ReservationPackage.js';

export const ReservationPackageBundle = [
  ReservationMixin as Mixin,
  ReservationPackageMixin as Mixin];
