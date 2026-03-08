import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommunicateActionMixin } from './CommunicateAction.js';

export interface CheckInAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CommunicateAction<D>, rdfine.RdfResource<D> {
}

export function CheckInActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CheckInAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CheckInActionClass extends CommunicateActionMixin(Resource) {
  }
  return CheckInActionClass as any
}
CheckInActionMixin.appliesTo = schema.CheckInAction
CheckInActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<CheckInAction>([CommunicateActionMixin, CheckInActionMixin], { types: [schema.CheckInAction] }, env)
