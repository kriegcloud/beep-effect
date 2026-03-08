import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MotorizedBicycleMixin } from '../lib/MotorizedBicycle.js';
import { VehicleMixin } from '../lib/Vehicle.js';

export const MotorizedBicycleBundle = [
  MotorizedBicycleMixin as Mixin,
  VehicleMixin as Mixin];
