import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BroadcastServiceMixin } from '../lib/BroadcastService.js';
import { EventMixin } from '../lib/Event.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PublicationEventMixin } from '../lib/PublicationEvent.js';

export const PublicationEventBundle = [
  BroadcastServiceMixin as Mixin,
  EventMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PublicationEventMixin as Mixin];
