import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GeneralContractorMixin } from '../lib/GeneralContractor.js';
import { HomeAndConstructionBusinessMixin } from '../lib/HomeAndConstructionBusiness.js';

export const GeneralContractorBundle = [
  GeneralContractorMixin as Mixin,
  HomeAndConstructionBusinessMixin as Mixin];
