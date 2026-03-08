import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { SeatMixin } from '../lib/Seat.js';

export const SeatBundle = [
  IntangibleMixin as Mixin,
  SeatMixin as Mixin];
