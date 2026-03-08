import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface TransferAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
  fromLocation: Schema.Place<D> | undefined;
  toLocation: Schema.Place<D> | undefined;
}

export function TransferActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TransferAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TransferActionClass extends ActionMixin(Resource) {
    @rdfine.property.resource()
    fromLocation: Schema.Place | undefined;
    @rdfine.property.resource()
    toLocation: Schema.Place | undefined;
  }
  return TransferActionClass as any
}
TransferActionMixin.appliesTo = schema.TransferAction
TransferActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<TransferAction>([ActionMixin, TransferActionMixin], { types: [schema.TransferAction] }, env)
