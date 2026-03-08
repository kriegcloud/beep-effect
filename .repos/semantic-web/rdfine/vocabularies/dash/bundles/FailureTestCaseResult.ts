import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FailureTestCaseResultMixin } from '../lib/FailureTestCaseResult.js';
import { TestCaseResultMixin } from '../lib/TestCaseResult.js';

export const FailureTestCaseResultBundle = [
  FailureTestCaseResultMixin as Mixin,
  TestCaseResultMixin as Mixin];
