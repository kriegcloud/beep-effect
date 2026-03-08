import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface MoveAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
  fromLocation: Schema.Place<D> | undefined;
  toLocation: Schema.Place<D> | undefined;
}

export function MoveActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MoveAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MoveActionClass extends ActionMixin(Resource) {
    @rdfine.property.resource()
    fromLocation: Schema.Place | undefined;
    @rdfine.property.resource()
    toLocation: Schema.Place | undefined;
  }
  return MoveActionClass as any
}
MoveActionMixin.appliesTo = schema.MoveAction
MoveActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<MoveAction>([ActionMixin, MoveActionMixin], { types: [schema.MoveAction] }, env)
