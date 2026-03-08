import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BroadcastChannelMixin } from '../lib/BroadcastChannel.js';
import { TelevisionChannelMixin } from '../lib/TelevisionChannel.js';

export const TelevisionChannelBundle = [
  BroadcastChannelMixin as Mixin,
  TelevisionChannelMixin as Mixin];
