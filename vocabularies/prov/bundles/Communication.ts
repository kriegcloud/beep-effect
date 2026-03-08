import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityInfluenceMixin } from '../lib/ActivityInfluence.js';
import { CommunicationMixin } from '../lib/Communication.js';

export const CommunicationBundle = [
  ActivityInfluenceMixin as Mixin,
  CommunicationMixin as Mixin];
