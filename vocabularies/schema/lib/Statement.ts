import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Statement<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function StatementMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Statement & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class StatementClass extends CreativeWorkMixin(Resource) {
  }
  return StatementClass as any
}
StatementMixin.appliesTo = schema.Statement
StatementMixin.createFactory = (env: RdfineEnvironment) => createFactory<Statement>([CreativeWorkMixin, StatementMixin], { types: [schema.Statement] }, env)
