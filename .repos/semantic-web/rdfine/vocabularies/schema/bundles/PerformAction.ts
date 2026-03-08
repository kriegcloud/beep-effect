import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';
import { PerformActionMixin } from '../lib/PerformAction.js';
import { PlayActionMixin } from '../lib/PlayAction.js';

export const PerformActionBundle = [
  EntertainmentBusinessMixin as Mixin,
  PerformActionMixin as Mixin,
  PlayActionMixin as Mixin];
