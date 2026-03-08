import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AnatomicalStructureMixin } from './AnatomicalStructure.js';

export interface BrainStructure<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AnatomicalStructure<D>, rdfine.RdfResource<D> {
}

export function BrainStructureMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BrainStructure & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BrainStructureClass extends AnatomicalStructureMixin(Resource) {
  }
  return BrainStructureClass as any
}
BrainStructureMixin.appliesTo = schema.BrainStructure
BrainStructureMixin.createFactory = (env: RdfineEnvironment) => createFactory<BrainStructure>([AnatomicalStructureMixin, BrainStructureMixin], { types: [schema.BrainStructure] }, env)
