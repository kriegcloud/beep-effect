import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ChildCareMixin } from '../lib/ChildCare.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const ChildCareBundle = [
  ChildCareMixin as Mixin,
  LocalBusinessMixin as Mixin];
