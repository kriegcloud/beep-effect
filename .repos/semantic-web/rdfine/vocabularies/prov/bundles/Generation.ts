import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityInfluenceMixin } from '../lib/ActivityInfluence.js';
import { GenerationMixin } from '../lib/Generation.js';
import { InstantaneousEventMixin } from '../lib/InstantaneousEvent.js';

export const GenerationBundle = [
  ActivityInfluenceMixin as Mixin,
  GenerationMixin as Mixin,
  InstantaneousEventMixin as Mixin];
