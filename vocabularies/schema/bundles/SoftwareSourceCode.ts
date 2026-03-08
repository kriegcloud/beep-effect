import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComputerLanguageMixin } from '../lib/ComputerLanguage.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { SoftwareApplicationMixin } from '../lib/SoftwareApplication.js';
import { SoftwareSourceCodeMixin } from '../lib/SoftwareSourceCode.js';

export const SoftwareSourceCodeBundle = [
  ComputerLanguageMixin as Mixin,
  CreativeWorkMixin as Mixin,
  SoftwareApplicationMixin as Mixin,
  SoftwareSourceCodeMixin as Mixin];
