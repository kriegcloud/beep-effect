import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { MedicalConditionMixin } from '../lib/MedicalCondition.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalStudyMixin } from '../lib/MedicalStudy.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const MedicalStudyBundle = [
  AdministrativeAreaMixin as Mixin,
  MedicalConditionMixin as Mixin,
  MedicalEntityMixin as Mixin,
  MedicalStudyMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
