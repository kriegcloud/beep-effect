import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LandmarksOrHistoricalBuildingsMixin } from '../lib/LandmarksOrHistoricalBuildings.js';
import { PlaceMixin } from '../lib/Place.js';

export const LandmarksOrHistoricalBuildingsBundle = [
  LandmarksOrHistoricalBuildingsMixin as Mixin,
  PlaceMixin as Mixin];
