import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GraphValidationTestCaseMixin } from '../lib/GraphValidationTestCase.js';
import { ValidationTestCaseMixin } from '../lib/ValidationTestCase.js';

export const GraphValidationTestCaseBundle = [
  GraphValidationTestCaseMixin as Mixin,
  ValidationTestCaseMixin as Mixin];
