import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface FindAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
}

export function FindActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FindAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FindActionClass extends ActionMixin(Resource) {
  }
  return FindActionClass as any
}
FindActionMixin.appliesTo = schema.FindAction
FindActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<FindAction>([ActionMixin, FindActionMixin], { types: [schema.FindAction] }, env)
