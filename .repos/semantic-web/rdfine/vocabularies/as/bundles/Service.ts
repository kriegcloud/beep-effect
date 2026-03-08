import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ObjectMixin } from '../lib/Object.js';
import { ServiceMixin } from '../lib/Service.js';

export const ServiceBundle = [
  ObjectMixin as Mixin,
  ServiceMixin as Mixin];
