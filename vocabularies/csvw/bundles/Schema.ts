import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ColumnMixin } from '../lib/Column.js';
import { DatatypeMixin } from '../lib/Datatype.js';
import { DirectionMixin } from '../lib/Direction.js';
import { ForeignKeyMixin } from '../lib/ForeignKey.js';
import { SchemaMixin } from '../lib/Schema.js';
import { TransformationMixin } from '../lib/Transformation.js';

export const SchemaBundle = [
  ColumnMixin as Mixin,
  DatatypeMixin as Mixin,
  DirectionMixin as Mixin,
  ForeignKeyMixin as Mixin,
  SchemaMixin as Mixin,
  TransformationMixin as Mixin];
