import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BroadcastChannelMixin } from '../lib/BroadcastChannel.js';
import { BroadcastFrequencySpecificationMixin } from '../lib/BroadcastFrequencySpecification.js';
import { BroadcastServiceMixin } from '../lib/BroadcastService.js';
import { CableOrSatelliteServiceMixin } from '../lib/CableOrSatelliteService.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const BroadcastChannelBundle = [
  BroadcastChannelMixin as Mixin,
  BroadcastFrequencySpecificationMixin as Mixin,
  BroadcastServiceMixin as Mixin,
  CableOrSatelliteServiceMixin as Mixin,
  IntangibleMixin as Mixin];
