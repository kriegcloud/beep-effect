import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { WebPageElementMixin } from './WebPageElement.js';

export interface Table<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.WebPageElement<D>, rdfine.RdfResource<D> {
}

export function TableMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Table & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TableClass extends WebPageElementMixin(Resource) {
  }
  return TableClass as any
}
TableMixin.appliesTo = schema.Table
TableMixin.createFactory = (env: RdfineEnvironment) => createFactory<Table>([WebPageElementMixin, TableMixin], { types: [schema.Table] }, env)
