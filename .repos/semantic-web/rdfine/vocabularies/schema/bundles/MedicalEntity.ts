import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DrugLegalStatusMixin } from '../lib/DrugLegalStatus.js';
import { GrantMixin } from '../lib/Grant.js';
import { MedicalCodeMixin } from '../lib/MedicalCode.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';
import { MedicalGuidelineMixin } from '../lib/MedicalGuideline.js';
import { MedicalStudyMixin } from '../lib/MedicalStudy.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { ThingMixin } from '../lib/Thing.js';

export const MedicalEntityBundle = [
  DrugLegalStatusMixin as Mixin,
  GrantMixin as Mixin,
  MedicalCodeMixin as Mixin,
  MedicalEntityMixin as Mixin,
  MedicalGuidelineMixin as Mixin,
  MedicalStudyMixin as Mixin,
  OrganizationMixin as Mixin,
  ThingMixin as Mixin];
