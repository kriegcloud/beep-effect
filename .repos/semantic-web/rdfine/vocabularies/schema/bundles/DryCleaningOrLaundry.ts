import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DryCleaningOrLaundryMixin } from '../lib/DryCleaningOrLaundry.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const DryCleaningOrLaundryBundle = [
  DryCleaningOrLaundryMixin as Mixin,
  LocalBusinessMixin as Mixin];
