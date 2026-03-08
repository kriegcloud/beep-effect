import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';
import { MotorcycleRepairMixin } from '../lib/MotorcycleRepair.js';

export const MotorcycleRepairBundle = [
  AutomotiveBusinessMixin as Mixin,
  MotorcycleRepairMixin as Mixin];
