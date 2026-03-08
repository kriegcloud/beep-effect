import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlanActionMixin } from './PlanAction.js';

export interface ReserveAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PlanAction<D>, rdfine.RdfResource<D> {
}

export function ReserveActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReserveAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReserveActionClass extends PlanActionMixin(Resource) {
  }
  return ReserveActionClass as any
}
ReserveActionMixin.appliesTo = schema.ReserveAction
ReserveActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReserveAction>([PlanActionMixin, ReserveActionMixin], { types: [schema.ReserveAction] }, env)
