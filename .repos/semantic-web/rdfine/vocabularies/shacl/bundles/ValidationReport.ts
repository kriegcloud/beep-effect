import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ValidationReportMixin } from '../lib/ValidationReport.js';
import { ValidationResultMixin } from '../lib/ValidationResult.js';

export const ValidationReportBundle = [
  ValidationReportMixin as Mixin,
  ValidationResultMixin as Mixin];
