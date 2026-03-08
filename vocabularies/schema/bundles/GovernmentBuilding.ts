import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { GovernmentBuildingMixin } from '../lib/GovernmentBuilding.js';

export const GovernmentBuildingBundle = [
  CivicStructureMixin as Mixin,
  GovernmentBuildingMixin as Mixin];
