import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InstantiationMixin } from '../lib/Instantiation.js';
import { NameMixin } from '../lib/Name.js';
import { RecordResourceMixin } from '../lib/RecordResource.js';
import { RuleMixin } from '../lib/Rule.js';
import { TitleMixin } from '../lib/Title.js';

export const TitleBundle = [
  InstantiationMixin as Mixin,
  NameMixin as Mixin,
  RecordResourceMixin as Mixin,
  RuleMixin as Mixin,
  TitleMixin as Mixin];
