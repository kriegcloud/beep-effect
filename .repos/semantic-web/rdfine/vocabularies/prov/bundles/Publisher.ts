import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PublisherMixin } from '../lib/Publisher.js';
import { RoleMixin } from '../lib/Role.js';

export const PublisherBundle = [
  PublisherMixin as Mixin,
  RoleMixin as Mixin];
