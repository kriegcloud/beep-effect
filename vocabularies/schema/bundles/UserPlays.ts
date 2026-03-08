import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UserInteractionMixin } from '../lib/UserInteraction.js';
import { UserPlaysMixin } from '../lib/UserPlays.js';

export const UserPlaysBundle = [
  UserInteractionMixin as Mixin,
  UserPlaysMixin as Mixin];
