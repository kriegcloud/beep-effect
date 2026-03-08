import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionAccessSpecificationMixin } from '../lib/ActionAccessSpecification.js';
import { ActionMixin } from '../lib/Action.js';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { OfferMixin } from '../lib/Offer.js';

export const ConsumeActionBundle = [
  ActionAccessSpecificationMixin as Mixin,
  ActionMixin as Mixin,
  ConsumeActionMixin as Mixin,
  OfferMixin as Mixin];
