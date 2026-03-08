import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AssessActionMixin } from './AssessAction.js';

export interface IgnoreAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AssessAction<D>, rdfine.RdfResource<D> {
}

export function IgnoreActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<IgnoreAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class IgnoreActionClass extends AssessActionMixin(Resource) {
  }
  return IgnoreActionClass as any
}
IgnoreActionMixin.appliesTo = schema.IgnoreAction
IgnoreActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<IgnoreAction>([AssessActionMixin, IgnoreActionMixin], { types: [schema.IgnoreAction] }, env)
