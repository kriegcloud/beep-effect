import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { TrainStationMixin } from '../lib/TrainStation.js';
import { TrainTripMixin } from '../lib/TrainTrip.js';
import { TripMixin } from '../lib/Trip.js';

export const TrainTripBundle = [
  TrainStationMixin as Mixin,
  TrainTripMixin as Mixin,
  TripMixin as Mixin];
