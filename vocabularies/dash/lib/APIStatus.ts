import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface APIStatus<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function APIStatusMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<APIStatus & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class APIStatusClass extends RdfsResourceMixin(Resource) {
  }
  return APIStatusClass as any
}
APIStatusMixin.appliesTo = dash.APIStatus
APIStatusMixin.createFactory = (env: RdfineEnvironment) => createFactory<APIStatus>([RdfsResourceMixin, APIStatusMixin], { types: [dash.APIStatus] }, env)
