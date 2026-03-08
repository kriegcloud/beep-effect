import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AudienceMixin } from '../lib/Audience.js';
import { TouristTripMixin } from '../lib/TouristTrip.js';
import { TripMixin } from '../lib/Trip.js';

export const TouristTripBundle = [
  AudienceMixin as Mixin,
  TouristTripMixin as Mixin,
  TripMixin as Mixin];
