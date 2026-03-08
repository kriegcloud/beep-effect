import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MoveActionMixin } from './MoveAction.js';

export interface ArriveAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MoveAction<D>, rdfine.RdfResource<D> {
}

export function ArriveActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ArriveAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ArriveActionClass extends MoveActionMixin(Resource) {
  }
  return ArriveActionClass as any
}
ArriveActionMixin.appliesTo = schema.ArriveAction
ArriveActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ArriveAction>([MoveActionMixin, ArriveActionMixin], { types: [schema.ArriveAction] }, env)
