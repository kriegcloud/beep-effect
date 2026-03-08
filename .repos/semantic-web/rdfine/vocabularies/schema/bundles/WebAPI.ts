import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { ServiceMixin } from '../lib/Service.js';
import { WebAPIMixin } from '../lib/WebAPI.js';

export const WebAPIBundle = [
  CreativeWorkMixin as Mixin,
  ServiceMixin as Mixin,
  WebAPIMixin as Mixin];
