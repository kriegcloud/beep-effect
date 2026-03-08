import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AirportMixin } from '../lib/Airport.js';
import { DistanceMixin } from '../lib/Distance.js';
import { DurationMixin } from '../lib/Duration.js';
import { FlightMixin } from '../lib/Flight.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { TripMixin } from '../lib/Trip.js';
import { VehicleMixin } from '../lib/Vehicle.js';

export const FlightBundle = [
  AirportMixin as Mixin,
  DistanceMixin as Mixin,
  DurationMixin as Mixin,
  FlightMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  TripMixin as Mixin,
  VehicleMixin as Mixin];
