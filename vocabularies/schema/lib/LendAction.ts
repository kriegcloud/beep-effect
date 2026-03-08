import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TransferActionMixin } from './TransferAction.js';

export interface LendAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TransferAction<D>, rdfine.RdfResource<D> {
  borrower: Schema.Person<D> | undefined;
}

export function LendActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LendAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LendActionClass extends TransferActionMixin(Resource) {
    @rdfine.property.resource()
    borrower: Schema.Person | undefined;
  }
  return LendActionClass as any
}
LendActionMixin.appliesTo = schema.LendAction
LendActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<LendAction>([TransferActionMixin, LendActionMixin], { types: [schema.LendAction] }, env)
