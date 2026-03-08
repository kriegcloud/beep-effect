import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CheckoutPageMixin } from '../lib/CheckoutPage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const CheckoutPageBundle = [
  CheckoutPageMixin as Mixin,
  WebPageMixin as Mixin];
