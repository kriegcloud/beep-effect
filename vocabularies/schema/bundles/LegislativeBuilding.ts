import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GovernmentBuildingMixin } from '../lib/GovernmentBuilding.js';
import { LegislativeBuildingMixin } from '../lib/LegislativeBuilding.js';

export const LegislativeBuildingBundle = [
  GovernmentBuildingMixin as Mixin,
  LegislativeBuildingMixin as Mixin];
