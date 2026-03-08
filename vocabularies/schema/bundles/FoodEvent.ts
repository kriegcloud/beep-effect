import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { FoodEventMixin } from '../lib/FoodEvent.js';

export const FoodEventBundle = [
  EventMixin as Mixin,
  FoodEventMixin as Mixin];
