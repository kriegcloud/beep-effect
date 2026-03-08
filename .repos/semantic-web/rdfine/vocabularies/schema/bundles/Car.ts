import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CarMixin } from '../lib/Car.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { VehicleMixin } from '../lib/Vehicle.js';

export const CarBundle = [
  CarMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  VehicleMixin as Mixin];
