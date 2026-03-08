import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BroadcastChannelMixin } from '../lib/BroadcastChannel.js';
import { BroadcastFrequencySpecificationMixin } from '../lib/BroadcastFrequencySpecification.js';
import { BroadcastServiceMixin } from '../lib/BroadcastService.js';
import { LanguageMixin } from '../lib/Language.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PlaceMixin } from '../lib/Place.js';
import { ServiceMixin } from '../lib/Service.js';

export const BroadcastServiceBundle = [
  BroadcastChannelMixin as Mixin,
  BroadcastFrequencySpecificationMixin as Mixin,
  BroadcastServiceMixin as Mixin,
  LanguageMixin as Mixin,
  OrganizationMixin as Mixin,
  PlaceMixin as Mixin,
  ServiceMixin as Mixin];
