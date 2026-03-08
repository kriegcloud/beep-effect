import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BusStationMixin } from '../lib/BusStation.js';
import { BusStopMixin } from '../lib/BusStop.js';
import { BusTripMixin } from '../lib/BusTrip.js';
import { TripMixin } from '../lib/Trip.js';

export const BusTripBundle = [
  BusStationMixin as Mixin,
  BusStopMixin as Mixin,
  BusTripMixin as Mixin,
  TripMixin as Mixin];
