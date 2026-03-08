import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DistanceMixin } from '../lib/Distance.js';
import { MoveActionMixin } from '../lib/MoveAction.js';
import { TravelActionMixin } from '../lib/TravelAction.js';

export const TravelActionBundle = [
  DistanceMixin as Mixin,
  MoveActionMixin as Mixin,
  TravelActionMixin as Mixin];
