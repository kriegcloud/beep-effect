import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommunicateActionMixin } from './CommunicateAction.js';

export interface CheckOutAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CommunicateAction<D>, rdfine.RdfResource<D> {
}

export function CheckOutActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CheckOutAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CheckOutActionClass extends CommunicateActionMixin(Resource) {
  }
  return CheckOutActionClass as any
}
CheckOutActionMixin.appliesTo = schema.CheckOutAction
CheckOutActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<CheckOutAction>([CommunicateActionMixin, CheckOutActionMixin], { types: [schema.CheckOutAction] }, env)
