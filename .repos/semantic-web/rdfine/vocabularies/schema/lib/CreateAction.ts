import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface CreateAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
}

export function CreateActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CreateAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CreateActionClass extends ActionMixin(Resource) {
  }
  return CreateActionClass as any
}
CreateActionMixin.appliesTo = schema.CreateAction
CreateActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<CreateAction>([ActionMixin, CreateActionMixin], { types: [schema.CreateAction] }, env)
