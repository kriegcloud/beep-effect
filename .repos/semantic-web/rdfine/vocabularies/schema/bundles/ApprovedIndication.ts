import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ApprovedIndicationMixin } from '../lib/ApprovedIndication.js';
import { MedicalIndicationMixin } from '../lib/MedicalIndication.js';

export const ApprovedIndicationBundle = [
  ApprovedIndicationMixin as Mixin,
  MedicalIndicationMixin as Mixin];
