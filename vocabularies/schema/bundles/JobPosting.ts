import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { JobPostingMixin } from '../lib/JobPosting.js';
import { MonetaryAmountDistributionMixin } from '../lib/MonetaryAmountDistribution.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { OccupationalExperienceRequirementsMixin } from '../lib/OccupationalExperienceRequirements.js';
import { OccupationMixin } from '../lib/Occupation.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PlaceMixin } from '../lib/Place.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';

export const JobPostingBundle = [
  AdministrativeAreaMixin as Mixin,
  CategoryCodeMixin as Mixin,
  ContactPointMixin as Mixin,
  IntangibleMixin as Mixin,
  JobPostingMixin as Mixin,
  MonetaryAmountDistributionMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  OccupationalExperienceRequirementsMixin as Mixin,
  OccupationMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PlaceMixin as Mixin,
  PriceSpecificationMixin as Mixin];
