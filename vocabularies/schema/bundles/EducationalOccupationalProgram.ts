import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AlignmentObjectMixin } from '../lib/AlignmentObject.js';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { CourseMixin } from '../lib/Course.js';
import { DemandMixin } from '../lib/Demand.js';
import { DurationMixin } from '../lib/Duration.js';
import { EducationalOccupationalProgramMixin } from '../lib/EducationalOccupationalProgram.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { MonetaryAmountDistributionMixin } from '../lib/MonetaryAmountDistribution.js';
import { OfferMixin } from '../lib/Offer.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const EducationalOccupationalProgramBundle = [
  AlignmentObjectMixin as Mixin,
  CategoryCodeMixin as Mixin,
  CourseMixin as Mixin,
  DemandMixin as Mixin,
  DurationMixin as Mixin,
  EducationalOccupationalProgramMixin as Mixin,
  IntangibleMixin as Mixin,
  MonetaryAmountDistributionMixin as Mixin,
  OfferMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  StructuredValueMixin as Mixin];
