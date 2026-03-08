import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionTestCaseMixin } from '../lib/ActionTestCase.js';
import { TestCaseMixin } from '../lib/TestCase.js';

export const ActionTestCaseBundle = [
  ActionTestCaseMixin as Mixin,
  TestCaseMixin as Mixin];
