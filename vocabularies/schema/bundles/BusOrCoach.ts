import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BusOrCoachMixin } from '../lib/BusOrCoach.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { VehicleMixin } from '../lib/Vehicle.js';

export const BusOrCoachBundle = [
  BusOrCoachMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  VehicleMixin as Mixin];
