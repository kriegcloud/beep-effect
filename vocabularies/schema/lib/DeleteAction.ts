import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UpdateActionMixin } from './UpdateAction.js';

export interface DeleteAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UpdateAction<D>, rdfine.RdfResource<D> {
}

export function DeleteActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DeleteAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DeleteActionClass extends UpdateActionMixin(Resource) {
  }
  return DeleteActionClass as any
}
DeleteActionMixin.appliesTo = schema.DeleteAction
DeleteActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DeleteAction>([UpdateActionMixin, DeleteActionMixin], { types: [schema.DeleteAction] }, env)
