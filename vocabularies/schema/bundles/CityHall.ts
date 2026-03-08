import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CityHallMixin } from '../lib/CityHall.js';
import { GovernmentBuildingMixin } from '../lib/GovernmentBuilding.js';

export const CityHallBundle = [
  CityHallMixin as Mixin,
  GovernmentBuildingMixin as Mixin];
