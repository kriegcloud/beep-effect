import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DietMixin } from '../lib/Diet.js';
import { LifestyleModificationMixin } from '../lib/LifestyleModification.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const DietBundle = [
  CreativeWorkMixin as Mixin,
  DietMixin as Mixin,
  LifestyleModificationMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
