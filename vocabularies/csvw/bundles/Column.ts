import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ColumnMixin } from '../lib/Column.js';
import { DatatypeMixin } from '../lib/Datatype.js';
import { DirectionMixin } from '../lib/Direction.js';
import { TransformationMixin } from '../lib/Transformation.js';

export const ColumnBundle = [
  ColumnMixin as Mixin,
  DatatypeMixin as Mixin,
  DirectionMixin as Mixin,
  TransformationMixin as Mixin];
