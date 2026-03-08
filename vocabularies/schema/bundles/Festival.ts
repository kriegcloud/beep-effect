import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { FestivalMixin } from '../lib/Festival.js';

export const FestivalBundle = [
  EventMixin as Mixin,
  FestivalMixin as Mixin];
