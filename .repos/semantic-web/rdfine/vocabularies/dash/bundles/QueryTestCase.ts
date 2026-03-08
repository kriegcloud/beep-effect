import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { QueryTestCaseMixin } from '../lib/QueryTestCase.js';
import { TestCaseMixin } from '../lib/TestCase.js';

export const QueryTestCaseBundle = [
  QueryTestCaseMixin as Mixin,
  TestCaseMixin as Mixin];
