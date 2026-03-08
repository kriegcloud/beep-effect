import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FunctionTestCaseMixin } from '../lib/FunctionTestCase.js';
import { TestCaseMixin } from '../lib/TestCase.js';

export const FunctionTestCaseBundle = [
  FunctionTestCaseMixin as Mixin,
  TestCaseMixin as Mixin];
