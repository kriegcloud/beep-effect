import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MotorcycleMixin } from '../lib/Motorcycle.js';
import { VehicleMixin } from '../lib/Vehicle.js';

export const MotorcycleBundle = [
  MotorcycleMixin as Mixin,
  VehicleMixin as Mixin];
