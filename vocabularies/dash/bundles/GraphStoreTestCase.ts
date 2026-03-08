import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GraphStoreTestCaseMixin } from '../lib/GraphStoreTestCase.js';
import { TestCaseMixin } from '../lib/TestCase.js';

export const GraphStoreTestCaseBundle = [
  GraphStoreTestCaseMixin as Mixin,
  TestCaseMixin as Mixin];
