import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BioChemEntityMixin } from '../lib/BioChemEntity.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { EventMixin } from '../lib/Event.js';
import { GrantMixin } from '../lib/Grant.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { ProductMixin } from '../lib/Product.js';

export const GrantBundle = [
  BioChemEntityMixin as Mixin,
  CreativeWorkMixin as Mixin,
  EventMixin as Mixin,
  GrantMixin as Mixin,
  IntangibleMixin as Mixin,
  MedicalEntityMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  ProductMixin as Mixin];
