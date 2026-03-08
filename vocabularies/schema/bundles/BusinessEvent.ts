import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BusinessEventMixin } from '../lib/BusinessEvent.js';
import { EventMixin } from '../lib/Event.js';

export const BusinessEventBundle = [
  BusinessEventMixin as Mixin,
  EventMixin as Mixin];
