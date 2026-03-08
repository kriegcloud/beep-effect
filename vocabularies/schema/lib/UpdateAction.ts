import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface UpdateAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
  collection: Schema.Thing<D> | undefined;
  targetCollection: Schema.Thing<D> | undefined;
}

export function UpdateActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UpdateAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UpdateActionClass extends ActionMixin(Resource) {
    @rdfine.property.resource()
    collection: Schema.Thing | undefined;
    @rdfine.property.resource()
    targetCollection: Schema.Thing | undefined;
  }
  return UpdateActionClass as any
}
UpdateActionMixin.appliesTo = schema.UpdateAction
UpdateActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<UpdateAction>([ActionMixin, UpdateActionMixin], { types: [schema.UpdateAction] }, env)
