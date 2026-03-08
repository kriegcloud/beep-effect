import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface RightsAssignment<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Activity<D>, rdfine.RdfResource<D> {
}

export function RightsAssignmentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RightsAssignment & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class RightsAssignmentClass extends ActivityMixin(Resource) {
  }
  return RightsAssignmentClass as any
}
RightsAssignmentMixin.appliesTo = prov.RightsAssignment
RightsAssignmentMixin.createFactory = (env: RdfineEnvironment) => createFactory<RightsAssignment>([ActivityMixin, RightsAssignmentMixin], { types: [prov.RightsAssignment] }, env)
