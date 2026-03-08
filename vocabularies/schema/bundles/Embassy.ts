import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EmbassyMixin } from '../lib/Embassy.js';
import { GovernmentBuildingMixin } from '../lib/GovernmentBuilding.js';

export const EmbassyBundle = [
  EmbassyMixin as Mixin,
  GovernmentBuildingMixin as Mixin];
