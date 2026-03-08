import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AssessActionMixin } from './AssessAction.js';

export interface ReactAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AssessAction<D>, rdfine.RdfResource<D> {
}

export function ReactActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReactAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReactActionClass extends AssessActionMixin(Resource) {
  }
  return ReactActionClass as any
}
ReactActionMixin.appliesTo = schema.ReactAction
ReactActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReactAction>([AssessActionMixin, ReactActionMixin], { types: [schema.ReactAction] }, env)
