import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ChildrensEventMixin } from '../lib/ChildrensEvent.js';
import { EventMixin } from '../lib/Event.js';

export const ChildrensEventBundle = [
  ChildrensEventMixin as Mixin,
  EventMixin as Mixin];
