import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FMRadioChannelMixin } from '../lib/FMRadioChannel.js';
import { RadioChannelMixin } from '../lib/RadioChannel.js';

export const FMRadioChannelBundle = [
  FMRadioChannelMixin as Mixin,
  RadioChannelMixin as Mixin];
