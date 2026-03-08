import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';
import { EmergencyServiceMixin } from './EmergencyService.js';

export interface FireStation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, Schema.EmergencyService<D>, rdfine.RdfResource<D> {
}

export function FireStationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FireStation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FireStationClass extends EmergencyServiceMixin(CivicStructureMixin(Resource)) {
  }
  return FireStationClass as any
}
FireStationMixin.appliesTo = schema.FireStation
FireStationMixin.createFactory = (env: RdfineEnvironment) => createFactory<FireStation>([EmergencyServiceMixin, CivicStructureMixin, FireStationMixin], { types: [schema.FireStation] }, env)
