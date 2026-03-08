import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ScriptMixin } from '../lib/Script.js';
import { ServiceMixin } from '../lib/Service.js';

export const ServiceBundle = [
  ScriptMixin as Mixin,
  ServiceMixin as Mixin];
