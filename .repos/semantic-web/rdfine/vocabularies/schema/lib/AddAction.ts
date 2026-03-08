import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UpdateActionMixin } from './UpdateAction.js';

export interface AddAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UpdateAction<D>, rdfine.RdfResource<D> {
}

export function AddActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AddAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AddActionClass extends UpdateActionMixin(Resource) {
  }
  return AddActionClass as any
}
AddActionMixin.appliesTo = schema.AddAction
AddActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<AddAction>([UpdateActionMixin, AddActionMixin], { types: [schema.AddAction] }, env)
