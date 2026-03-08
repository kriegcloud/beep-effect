import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { LegislationMixin } from '../lib/Legislation.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const LegislationBundle = [
  AdministrativeAreaMixin as Mixin,
  CategoryCodeMixin as Mixin,
  CreativeWorkMixin as Mixin,
  LegislationMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
