import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { UserInteractionMixin } from '../lib/UserInteraction.js';
import { UserPageVisitsMixin } from '../lib/UserPageVisits.js';

export const UserPageVisitsBundle = [
  UserInteractionMixin as Mixin,
  UserPageVisitsMixin as Mixin];
