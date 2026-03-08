import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DerivationMixin } from '../lib/Derivation.js';
import { QuotationMixin } from '../lib/Quotation.js';

export const QuotationBundle = [
  DerivationMixin as Mixin,
  QuotationMixin as Mixin];
