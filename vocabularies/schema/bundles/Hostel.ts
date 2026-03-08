import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HostelMixin } from '../lib/Hostel.js';
import { LodgingBusinessMixin } from '../lib/LodgingBusiness.js';

export const HostelBundle = [
  HostelMixin as Mixin,
  LodgingBusinessMixin as Mixin];
