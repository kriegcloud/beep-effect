import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DanceEventMixin } from '../lib/DanceEvent.js';
import { EventMixin } from '../lib/Event.js';

export const DanceEventBundle = [
  DanceEventMixin as Mixin,
  EventMixin as Mixin];
