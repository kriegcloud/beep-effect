import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface BusStop<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function BusStopMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BusStop & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BusStopClass extends CivicStructureMixin(Resource) {
  }
  return BusStopClass as any
}
BusStopMixin.appliesTo = schema.BusStop
BusStopMixin.createFactory = (env: RdfineEnvironment) => createFactory<BusStop>([CivicStructureMixin, BusStopMixin], { types: [schema.BusStop] }, env)
