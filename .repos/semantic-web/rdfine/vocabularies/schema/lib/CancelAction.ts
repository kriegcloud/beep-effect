import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlanActionMixin } from './PlanAction.js';

export interface CancelAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PlanAction<D>, rdfine.RdfResource<D> {
}

export function CancelActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CancelAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CancelActionClass extends PlanActionMixin(Resource) {
  }
  return CancelActionClass as any
}
CancelActionMixin.appliesTo = schema.CancelAction
CancelActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<CancelAction>([PlanActionMixin, CancelActionMixin], { types: [schema.CancelAction] }, env)
