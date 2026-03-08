import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EndorseActionMixin } from '../lib/EndorseAction.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { ReactActionMixin } from '../lib/ReactAction.js';

export const EndorseActionBundle = [
  EndorseActionMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  ReactActionMixin as Mixin];
