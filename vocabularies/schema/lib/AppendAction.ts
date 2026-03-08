import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InsertActionMixin } from './InsertAction.js';

export interface AppendAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InsertAction<D>, rdfine.RdfResource<D> {
}

export function AppendActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AppendAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AppendActionClass extends InsertActionMixin(Resource) {
  }
  return AppendActionClass as any
}
AppendActionMixin.appliesTo = schema.AppendAction
AppendActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<AppendAction>([InsertActionMixin, AppendActionMixin], { types: [schema.AppendAction] }, env)
