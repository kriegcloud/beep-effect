import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ServiceMixin } from './Service.js';

export interface ResourceService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Service<D>, rdfine.RdfResource<D> {
}

export function ResourceServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ResourceService & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ResourceServiceClass extends ServiceMixin(Resource) {
  }
  return ResourceServiceClass as any
}
ResourceServiceMixin.appliesTo = dash.ResourceService
ResourceServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<ResourceService>([ServiceMixin, ResourceServiceMixin], { types: [dash.ResourceService] }, env)
