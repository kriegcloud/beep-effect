import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FindActionMixin } from '../lib/FindAction.js';
import { TrackActionMixin } from '../lib/TrackAction.js';

export const TrackActionBundle = [
  FindActionMixin as Mixin,
  TrackActionMixin as Mixin];
