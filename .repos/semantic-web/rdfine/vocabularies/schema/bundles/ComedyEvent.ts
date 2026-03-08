import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComedyEventMixin } from '../lib/ComedyEvent.js';
import { EventMixin } from '../lib/Event.js';

export const ComedyEventBundle = [
  ComedyEventMixin as Mixin,
  EventMixin as Mixin];
