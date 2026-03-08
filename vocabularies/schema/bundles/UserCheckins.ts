import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UserCheckinsMixin } from '../lib/UserCheckins.js';
import { UserInteractionMixin } from '../lib/UserInteraction.js';

export const UserCheckinsBundle = [
  UserCheckinsMixin as Mixin,
  UserInteractionMixin as Mixin];
