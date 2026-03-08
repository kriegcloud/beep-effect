import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ResourceServiceMixin } from '../lib/ResourceService.js';
import { ServiceMixin } from '../lib/Service.js';

export const ResourceServiceBundle = [
  ResourceServiceMixin as Mixin,
  ServiceMixin as Mixin];
