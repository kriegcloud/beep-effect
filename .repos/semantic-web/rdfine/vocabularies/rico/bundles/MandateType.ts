import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MandateMixin } from '../lib/Mandate.js';
import { MandateTypeMixin } from '../lib/MandateType.js';
import { RuleTypeMixin } from '../lib/RuleType.js';

export const MandateTypeBundle = [
  MandateMixin as Mixin,
  MandateTypeMixin as Mixin,
  RuleTypeMixin as Mixin];
