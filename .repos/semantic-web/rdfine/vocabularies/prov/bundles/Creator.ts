import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContributorMixin } from '../lib/Contributor.js';
import { CreatorMixin } from '../lib/Creator.js';

export const CreatorBundle = [
  ContributorMixin as Mixin,
  CreatorMixin as Mixin];
