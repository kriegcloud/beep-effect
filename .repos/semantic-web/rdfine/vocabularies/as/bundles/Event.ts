import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { ObjectMixin } from '../lib/Object.js';

export const EventBundle = [
  EventMixin as Mixin,
  ObjectMixin as Mixin];
