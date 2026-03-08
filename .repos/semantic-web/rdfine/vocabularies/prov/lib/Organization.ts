import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { AgentMixin } from './Agent.js';

export interface Organization<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.Agent<D>, rdfine.RdfResource<D> {
}

export function OrganizationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Organization & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class OrganizationClass extends AgentMixin(Resource) {
  }
  return OrganizationClass as any
}
OrganizationMixin.appliesTo = prov.Organization
OrganizationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Organization>([AgentMixin, OrganizationMixin], { types: [prov.Organization] }, env)
