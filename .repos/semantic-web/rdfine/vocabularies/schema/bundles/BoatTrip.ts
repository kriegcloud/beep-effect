import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BoatTerminalMixin } from '../lib/BoatTerminal.js';
import { BoatTripMixin } from '../lib/BoatTrip.js';
import { TripMixin } from '../lib/Trip.js';

export const BoatTripBundle = [
  BoatTerminalMixin as Mixin,
  BoatTripMixin as Mixin,
  TripMixin as Mixin];
