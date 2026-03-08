import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DeliveryEventMixin } from '../lib/DeliveryEvent.js';
import { EventMixin } from '../lib/Event.js';

export const DeliveryEventBundle = [
  DeliveryEventMixin as Mixin,
  EventMixin as Mixin];
