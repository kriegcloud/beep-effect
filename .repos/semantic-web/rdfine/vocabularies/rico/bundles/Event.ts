import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DateMixin } from '../lib/Date.js';
import { EventMixin } from '../lib/Event.js';
import { EventTypeMixin } from '../lib/EventType.js';
import { ThingMixin } from '../lib/Thing.js';

export const EventBundle = [
  DateMixin as Mixin,
  EventMixin as Mixin,
  EventTypeMixin as Mixin,
  ThingMixin as Mixin];
