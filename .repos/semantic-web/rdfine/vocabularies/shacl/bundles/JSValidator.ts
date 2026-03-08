import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { JSExecutableMixin } from '../lib/JSExecutable.js';
import { JSValidatorMixin } from '../lib/JSValidator.js';
import { ValidatorMixin } from '../lib/Validator.js';

export const JSValidatorBundle = [
  JSExecutableMixin as Mixin,
  JSValidatorMixin as Mixin,
  ValidatorMixin as Mixin];
