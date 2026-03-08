import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SuccessTestCaseResultMixin } from '../lib/SuccessTestCaseResult.js';
import { TestCaseResultMixin } from '../lib/TestCaseResult.js';

export const SuccessTestCaseResultBundle = [
  SuccessTestCaseResultMixin as Mixin,
  TestCaseResultMixin as Mixin];
