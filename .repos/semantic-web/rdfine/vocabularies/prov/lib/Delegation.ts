import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { AgentInfluenceMixin } from './AgentInfluence.js';

export interface Delegation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.AgentInfluence<D>, rdfine.RdfResource<D> {
  hadActivity: Prov.Activity<D> | undefined;
}

export function DelegationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Delegation & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class DelegationClass extends AgentInfluenceMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [prov.Activity] })
    hadActivity: Prov.Activity | undefined;
  }
  return DelegationClass as any
}
DelegationMixin.appliesTo = prov.Delegation
DelegationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Delegation>([AgentInfluenceMixin, DelegationMixin], { types: [prov.Delegation] }, env)
