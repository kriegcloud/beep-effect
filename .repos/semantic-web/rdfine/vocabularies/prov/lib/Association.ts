import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { AgentInfluenceMixin } from './AgentInfluence.js';

export interface Association<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.AgentInfluence<D>, rdfine.RdfResource<D> {
  hadPlan: Prov.Plan<D> | undefined;
  hadRole: Prov.Role<D> | undefined;
}

export function AssociationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Association & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class AssociationClass extends AgentInfluenceMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [prov.Plan] })
    hadPlan: Prov.Plan | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Role] })
    hadRole: Prov.Role | undefined;
  }
  return AssociationClass as any
}
AssociationMixin.appliesTo = prov.Association
AssociationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Association>([AgentInfluenceMixin, AssociationMixin], { types: [prov.Association] }, env)
