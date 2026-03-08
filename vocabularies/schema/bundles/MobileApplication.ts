import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MobileApplicationMixin } from '../lib/MobileApplication.js';
import { SoftwareApplicationMixin } from '../lib/SoftwareApplication.js';

export const MobileApplicationBundle = [
  MobileApplicationMixin as Mixin,
  SoftwareApplicationMixin as Mixin];
