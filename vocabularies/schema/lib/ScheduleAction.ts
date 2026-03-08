import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlanActionMixin } from './PlanAction.js';

export interface ScheduleAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PlanAction<D>, rdfine.RdfResource<D> {
}

export function ScheduleActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ScheduleAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ScheduleActionClass extends PlanActionMixin(Resource) {
  }
  return ScheduleActionClass as any
}
ScheduleActionMixin.appliesTo = schema.ScheduleAction
ScheduleActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ScheduleAction>([PlanActionMixin, ScheduleActionMixin], { types: [schema.ScheduleAction] }, env)
