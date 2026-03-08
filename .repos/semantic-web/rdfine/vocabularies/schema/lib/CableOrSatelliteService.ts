import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ServiceMixin } from './Service.js';

export interface CableOrSatelliteService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Service<D>, rdfine.RdfResource<D> {
}

export function CableOrSatelliteServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CableOrSatelliteService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CableOrSatelliteServiceClass extends ServiceMixin(Resource) {
  }
  return CableOrSatelliteServiceClass as any
}
CableOrSatelliteServiceMixin.appliesTo = schema.CableOrSatelliteService
CableOrSatelliteServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<CableOrSatelliteService>([ServiceMixin, CableOrSatelliteServiceMixin], { types: [schema.CableOrSatelliteService] }, env)
