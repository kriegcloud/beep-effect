import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UserInteractionMixin } from '../lib/UserInteraction.js';
import { UserPlusOnesMixin } from '../lib/UserPlusOnes.js';

export const UserPlusOnesBundle = [
  UserInteractionMixin as Mixin,
  UserPlusOnesMixin as Mixin];
