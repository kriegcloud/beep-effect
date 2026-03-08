import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BroadcastServiceMixin } from '../lib/BroadcastService.js';
import { RadioBroadcastServiceMixin } from '../lib/RadioBroadcastService.js';

export const RadioBroadcastServiceBundle = [
  BroadcastServiceMixin as Mixin,
  RadioBroadcastServiceMixin as Mixin];
