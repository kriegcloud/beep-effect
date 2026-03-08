import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ServiceMixin } from './Service.js';

export interface GraphService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Service<D>, rdfine.RdfResource<D> {
}

export function GraphServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GraphService & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class GraphServiceClass extends ServiceMixin(Resource) {
  }
  return GraphServiceClass as any
}
GraphServiceMixin.appliesTo = dash.GraphService
GraphServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<GraphService>([ServiceMixin, GraphServiceMixin], { types: [dash.GraphService] }, env)
