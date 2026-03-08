import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { EducationalOccupationalProgramMixin } from '../lib/EducationalOccupationalProgram.js';
import { MonetaryAmountDistributionMixin } from '../lib/MonetaryAmountDistribution.js';
import { WorkBasedProgramMixin } from '../lib/WorkBasedProgram.js';

export const WorkBasedProgramBundle = [
  CategoryCodeMixin as Mixin,
  EducationalOccupationalProgramMixin as Mixin,
  MonetaryAmountDistributionMixin as Mixin,
  WorkBasedProgramMixin as Mixin];
