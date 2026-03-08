import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { TheaterEventMixin } from '../lib/TheaterEvent.js';

export const TheaterEventBundle = [
  EventMixin as Mixin,
  TheaterEventMixin as Mixin];
