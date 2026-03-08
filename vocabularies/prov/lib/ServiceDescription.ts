import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { SoftwareAgentMixin } from './SoftwareAgent.js';

export interface ServiceDescription<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.SoftwareAgent<D>, rdfine.RdfResource<D> {
}

export function ServiceDescriptionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ServiceDescription & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class ServiceDescriptionClass extends SoftwareAgentMixin(Resource) {
  }
  return ServiceDescriptionClass as any
}
ServiceDescriptionMixin.appliesTo = prov.ServiceDescription
ServiceDescriptionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ServiceDescription>([SoftwareAgentMixin, ServiceDescriptionMixin], { types: [prov.ServiceDescription] }, env)
