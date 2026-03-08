import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FundingAgencyMixin } from '../lib/FundingAgency.js';
import { ProjectMixin } from '../lib/Project.js';

export const FundingAgencyBundle = [
  FundingAgencyMixin as Mixin,
  ProjectMixin as Mixin];
