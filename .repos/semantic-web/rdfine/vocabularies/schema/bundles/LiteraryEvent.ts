import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { LiteraryEventMixin } from '../lib/LiteraryEvent.js';

export const LiteraryEventBundle = [
  EventMixin as Mixin,
  LiteraryEventMixin as Mixin];
