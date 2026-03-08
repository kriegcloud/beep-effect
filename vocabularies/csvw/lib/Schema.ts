import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { csvw } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Csvw from '../index.js';

export interface Schema<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  aboutUrl: string | undefined;
  column: Array<Csvw.Column<D>>;
  datatype: Csvw.Datatype<D> | undefined;
  datatypeLiteral: string | undefined;
  default: string | undefined;
  foreignKey: Csvw.ForeignKey<D> | undefined;
  lang: string | undefined;
  null: string | undefined;
  ordered: boolean | undefined;
  primaryKey: string | undefined;
  propertyUrl: string | undefined;
  required: boolean | undefined;
  rowTitle: string | undefined;
  separator: string | undefined;
  textDirection: Csvw.Direction<D> | undefined;
  transformations: Array<Csvw.Transformation<D>>;
  valueUrl: string | undefined;
}

export function SchemaMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Schema & RdfResourceCore> & Base {
  @rdfine.namespace(csvw)
  class SchemaClass extends Resource {
    @rdfine.property.literal()
    aboutUrl: string | undefined;
    @rdfine.property.resource({ values: 'list', implicitTypes: [csvw.Column] })
    column!: Array<Csvw.Column>;
    @rdfine.property.resource({ implicitTypes: [csvw.Datatype] })
    datatype: Csvw.Datatype | undefined;
    @rdfine.property.literal({ path: csvw.datatype })
    datatypeLiteral: string | undefined;
    @rdfine.property.literal()
    default: string | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.ForeignKey] })
    foreignKey: Csvw.ForeignKey | undefined;
    @rdfine.property.literal()
    lang: string | undefined;
    @rdfine.property.literal()
    null: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    ordered: boolean | undefined;
    @rdfine.property.literal()
    primaryKey: string | undefined;
    @rdfine.property.literal()
    propertyUrl: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    required: boolean | undefined;
    @rdfine.property.literal()
    rowTitle: string | undefined;
    @rdfine.property.literal()
    separator: string | undefined;
    @rdfine.property.resource({ implicitTypes: [csvw.Direction] })
    textDirection: Csvw.Direction | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [csvw.Transformation] })
    transformations!: Array<Csvw.Transformation>;
    @rdfine.property.literal()
    valueUrl: string | undefined;
  }
  return SchemaClass as any
}
SchemaMixin.appliesTo = csvw.Schema
SchemaMixin.createFactory = (env: RdfineEnvironment) => createFactory<Schema>([SchemaMixin], { types: [csvw.Schema] }, env)
