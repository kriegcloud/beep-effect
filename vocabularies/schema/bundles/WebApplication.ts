import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SoftwareApplicationMixin } from '../lib/SoftwareApplication.js';
import { WebApplicationMixin } from '../lib/WebApplication.js';

export const WebApplicationBundle = [
  SoftwareApplicationMixin as Mixin,
  WebApplicationMixin as Mixin];
