import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { FlagMixin } from '../lib/Flag.js';

export const FlagBundle = [
  ActivityMixin as Mixin,
  FlagMixin as Mixin];
