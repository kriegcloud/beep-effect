import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MedicalContraindicationMixin } from '../lib/MedicalContraindication.js';
import { MedicalDeviceMixin } from '../lib/MedicalDevice.js';
import { MedicalEntityMixin } from '../lib/MedicalEntity.js';

export const MedicalDeviceBundle = [
  MedicalContraindicationMixin as Mixin,
  MedicalDeviceMixin as Mixin,
  MedicalEntityMixin as Mixin];
