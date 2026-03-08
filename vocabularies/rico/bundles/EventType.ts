import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { EventTypeMixin } from '../lib/EventType.js';
import { TypeMixin } from '../lib/Type.js';

export const EventTypeBundle = [
  EventMixin as Mixin,
  EventTypeMixin as Mixin,
  TypeMixin as Mixin];
