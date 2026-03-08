import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AnatomicalStructureMixin } from './AnatomicalStructure.js';

export interface Vessel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AnatomicalStructure<D>, rdfine.RdfResource<D> {
}

export function VesselMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Vessel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VesselClass extends AnatomicalStructureMixin(Resource) {
  }
  return VesselClass as any
}
VesselMixin.appliesTo = schema.Vessel
VesselMixin.createFactory = (env: RdfineEnvironment) => createFactory<Vessel>([AnatomicalStructureMixin, VesselMixin], { types: [schema.Vessel] }, env)
