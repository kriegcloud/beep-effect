import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { MoveMixin } from '../lib/Move.js';

export const MoveBundle = [
  ActivityMixin as Mixin,
  MoveMixin as Mixin];
