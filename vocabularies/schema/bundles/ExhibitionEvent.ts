import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { ExhibitionEventMixin } from '../lib/ExhibitionEvent.js';

export const ExhibitionEventBundle = [
  EventMixin as Mixin,
  ExhibitionEventMixin as Mixin];
