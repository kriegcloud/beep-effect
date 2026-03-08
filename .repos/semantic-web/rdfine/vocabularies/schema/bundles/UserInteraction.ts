import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { UserInteractionMixin } from '../lib/UserInteraction.js';

export const UserInteractionBundle = [
  EventMixin as Mixin,
  UserInteractionMixin as Mixin];
