import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BroadcastChannelMixin } from '../lib/BroadcastChannel.js';
import { RadioChannelMixin } from '../lib/RadioChannel.js';

export const RadioChannelBundle = [
  BroadcastChannelMixin as Mixin,
  RadioChannelMixin as Mixin];
