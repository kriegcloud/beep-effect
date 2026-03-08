import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GatedResidenceCommunityMixin } from '../lib/GatedResidenceCommunity.js';
import { ResidenceMixin } from '../lib/Residence.js';

export const GatedResidenceCommunityBundle = [
  GatedResidenceCommunityMixin as Mixin,
  ResidenceMixin as Mixin];
