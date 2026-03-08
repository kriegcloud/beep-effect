import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';
import { AutoRepairMixin } from '../lib/AutoRepair.js';

export const AutoRepairBundle = [
  AutomotiveBusinessMixin as Mixin,
  AutoRepairMixin as Mixin];
