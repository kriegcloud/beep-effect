import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalAudienceMixin } from '../lib/MedicalAudience.js';
import { MedicalWebPageMixin } from '../lib/MedicalWebPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const MedicalWebPageBundle = [
  MedicalAudienceMixin as Mixin,
  MedicalWebPageMixin as Mixin,
  WebPageMixin as Mixin];
