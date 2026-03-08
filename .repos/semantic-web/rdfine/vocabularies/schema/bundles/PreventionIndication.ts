import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalIndicationMixin } from '../lib/MedicalIndication.js';
import { PreventionIndicationMixin } from '../lib/PreventionIndication.js';

export const PreventionIndicationBundle = [
  MedicalIndicationMixin as Mixin,
  PreventionIndicationMixin as Mixin];
