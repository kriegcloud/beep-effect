import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';
import { SoftwareAgentMixin } from './SoftwareAgent.js';

export interface DirectQueryService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Prov.SoftwareAgent<D>, rdfine.RdfResource<D> {
}

export function DirectQueryServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DirectQueryService & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class DirectQueryServiceClass extends SoftwareAgentMixin(Resource) {
  }
  return DirectQueryServiceClass as any
}
DirectQueryServiceMixin.appliesTo = prov.DirectQueryService
DirectQueryServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<DirectQueryService>([SoftwareAgentMixin, DirectQueryServiceMixin], { types: [prov.DirectQueryService] }, env)
