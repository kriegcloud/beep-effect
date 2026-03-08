import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ScriptMixin } from '../lib/Script.js';
import { ScriptTestCaseMixin } from '../lib/ScriptTestCase.js';
import { TestCaseMixin } from '../lib/TestCase.js';

export const ScriptTestCaseBundle = [
  ScriptMixin as Mixin,
  ScriptTestCaseMixin as Mixin,
  TestCaseMixin as Mixin];
