import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { OrganizeActionMixin } from './OrganizeAction.js';

export interface PlanAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.OrganizeAction<D>, rdfine.RdfResource<D> {
  scheduledTime: Date | undefined;
}

export function PlanActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PlanAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PlanActionClass extends OrganizeActionMixin(Resource) {
    @rdfine.property.literal({ type: Date })
    scheduledTime: Date | undefined;
  }
  return PlanActionClass as any
}
PlanActionMixin.appliesTo = schema.PlanAction
PlanActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<PlanAction>([OrganizeActionMixin, PlanActionMixin], { types: [schema.PlanAction] }, env)
