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

export interface PoliceStation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, Schema.EmergencyService<D>, rdfine.RdfResource<D> {
}

export function PoliceStationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PoliceStation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PoliceStationClass extends EmergencyServiceMixin(CivicStructureMixin(Resource)) {
  }
  return PoliceStationClass as any
}
PoliceStationMixin.appliesTo = schema.PoliceStation
PoliceStationMixin.createFactory = (env: RdfineEnvironment) => createFactory<PoliceStation>([EmergencyServiceMixin, CivicStructureMixin, PoliceStationMixin], { types: [schema.PoliceStation] }, env)
