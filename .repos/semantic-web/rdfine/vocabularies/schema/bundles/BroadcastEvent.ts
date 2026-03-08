import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BroadcastEventMixin } from '../lib/BroadcastEvent.js';
import { EventMixin } from '../lib/Event.js';
import { LanguageMixin } from '../lib/Language.js';
import { PublicationEventMixin } from '../lib/PublicationEvent.js';

export const BroadcastEventBundle = [
  BroadcastEventMixin as Mixin,
  EventMixin as Mixin,
  LanguageMixin as Mixin,
  PublicationEventMixin as Mixin];
