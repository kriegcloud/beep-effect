import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InferencingTestCaseMixin } from '../lib/InferencingTestCase.js';
import { TestCaseMixin } from '../lib/TestCase.js';

export const InferencingTestCaseBundle = [
  InferencingTestCaseMixin as Mixin,
  TestCaseMixin as Mixin];
