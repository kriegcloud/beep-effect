import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { EntityMixin } from './Entity.js';

export interface Plan<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Entity<D>, rdfine.RdfResource<D> {
}

export function PlanMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Plan & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class PlanClass extends EntityMixin(Resource) {
  }
  return PlanClass as any
}
PlanMixin.appliesTo = prov.Plan
PlanMixin.createFactory = (env: RdfineEnvironment) => createFactory<Plan>([EntityMixin, PlanMixin], { types: [prov.Plan] }, env)
