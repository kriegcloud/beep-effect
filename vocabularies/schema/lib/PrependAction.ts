import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InsertActionMixin } from './InsertAction.js';

export interface PrependAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InsertAction<D>, rdfine.RdfResource<D> {
}

export function PrependActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PrependAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PrependActionClass extends InsertActionMixin(Resource) {
  }
  return PrependActionClass as any
}
PrependActionMixin.appliesTo = schema.PrependAction
PrependActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<PrependAction>([InsertActionMixin, PrependActionMixin], { types: [schema.PrependAction] }, env)
