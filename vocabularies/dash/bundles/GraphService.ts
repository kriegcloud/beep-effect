import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GraphServiceMixin } from '../lib/GraphService.js';
import { ServiceMixin } from '../lib/Service.js';

export const GraphServiceBundle = [
  GraphServiceMixin as Mixin,
  ServiceMixin as Mixin];
