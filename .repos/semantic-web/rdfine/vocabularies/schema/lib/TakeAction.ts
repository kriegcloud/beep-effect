import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TransferActionMixin } from './TransferAction.js';

export interface TakeAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TransferAction<D>, rdfine.RdfResource<D> {
}

export function TakeActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TakeAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TakeActionClass extends TransferActionMixin(Resource) {
  }
  return TakeActionClass as any
}
TakeActionMixin.appliesTo = schema.TakeAction
TakeActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<TakeAction>([TransferActionMixin, TakeActionMixin], { types: [schema.TakeAction] }, env)
