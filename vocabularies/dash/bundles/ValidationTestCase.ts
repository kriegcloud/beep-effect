import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { TestCaseMixin } from '../lib/TestCase.js';
import { ValidationTestCaseMixin } from '../lib/ValidationTestCase.js';

export const ValidationTestCaseBundle = [
  TestCaseMixin as Mixin,
  ValidationTestCaseMixin as Mixin];
