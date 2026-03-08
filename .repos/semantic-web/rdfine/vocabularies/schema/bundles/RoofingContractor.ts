import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';
import { RoofingContractorMixin } from '../lib/RoofingContractor.js';

export const RoofingContractorBundle = [
  HomeAndConstructionBusinessMixin as Mixin,
  RoofingContractorMixin as Mixin];
