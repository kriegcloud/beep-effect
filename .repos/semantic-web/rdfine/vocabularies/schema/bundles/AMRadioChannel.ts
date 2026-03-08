import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AMRadioChannelMixin } from '../lib/AMRadioChannel.js';
import { RadioChannelMixin } from '../lib/RadioChannel.js';

export const AMRadioChannelBundle = [
  AMRadioChannelMixin as Mixin,
  RadioChannelMixin as Mixin];
