import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OnDemandEventMixin } from '../lib/OnDemandEvent.js';
import { PublicationEventMixin } from '../lib/PublicationEvent.js';

export const OnDemandEventBundle = [
  OnDemandEventMixin as Mixin,
  PublicationEventMixin as Mixin];
