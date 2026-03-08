import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SPARQLAskExecutableMixin } from '../lib/SPARQLAskExecutable.js';
import { SPARQLAskValidatorMixin } from '../lib/SPARQLAskValidator.js';
import { ValidatorMixin } from '../lib/Validator.js';

export const SPARQLAskValidatorBundle = [
  SPARQLAskExecutableMixin as Mixin,
  SPARQLAskValidatorMixin as Mixin,
  ValidatorMixin as Mixin];
