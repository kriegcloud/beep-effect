import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CourthouseMixin } from '../lib/Courthouse.js';
import { GovernmentBuildingMixin } from '../lib/GovernmentBuilding.js';

export const CourthouseBundle = [
  CourthouseMixin as Mixin,
  GovernmentBuildingMixin as Mixin];
