import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { SocialEventMixin } from '../lib/SocialEvent.js';

export const SocialEventBundle = [
  EventMixin as Mixin,
  SocialEventMixin as Mixin];
