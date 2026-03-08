import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { ContributeMixin } from '../lib/Contribute.js';

export const ContributeBundle = [
  ActivityMixin as Mixin,
  ContributeMixin as Mixin];
