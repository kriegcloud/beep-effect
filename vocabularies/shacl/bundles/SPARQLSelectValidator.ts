import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ResultAnnotationMixin } from '../lib/ResultAnnotation.js';
import { SPARQLSelectExecutableMixin } from '../lib/SPARQLSelectExecutable.js';
import { SPARQLSelectValidatorMixin } from '../lib/SPARQLSelectValidator.js';
import { ValidatorMixin } from '../lib/Validator.js';

export const SPARQLSelectValidatorBundle = [
  ResultAnnotationMixin as Mixin,
  SPARQLSelectExecutableMixin as Mixin,
  SPARQLSelectValidatorMixin as Mixin,
  ValidatorMixin as Mixin];
