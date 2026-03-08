import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Aquarium<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function AquariumMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Aquarium & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AquariumClass extends CivicStructureMixin(Resource) {
  }
  return AquariumClass as any
}
AquariumMixin.appliesTo = schema.Aquarium
AquariumMixin.createFactory = (env: RdfineEnvironment) => createFactory<Aquarium>([CivicStructureMixin, AquariumMixin], { types: [schema.Aquarium] }, env)
