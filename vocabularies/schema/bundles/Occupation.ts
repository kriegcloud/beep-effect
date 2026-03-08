import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { MonetaryAmountDistributionMixin } from '../lib/MonetaryAmountDistribution.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { OccupationalExperienceRequirementsMixin } from '../lib/OccupationalExperienceRequirements.js';
import { OccupationMixin } from '../lib/Occupation.js';

export const OccupationBundle = [
  AdministrativeAreaMixin as Mixin,
  CategoryCodeMixin as Mixin,
  IntangibleMixin as Mixin,
  MonetaryAmountDistributionMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  OccupationalExperienceRequirementsMixin as Mixin,
  OccupationMixin as Mixin];
