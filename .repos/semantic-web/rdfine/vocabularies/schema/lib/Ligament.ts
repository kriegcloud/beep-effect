import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AnatomicalStructureMixin } from './AnatomicalStructure.js';

export interface Ligament<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AnatomicalStructure<D>, rdfine.RdfResource<D> {
}

export function LigamentMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Ligament & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LigamentClass extends AnatomicalStructureMixin(Resource) {
  }
  return LigamentClass as any
}
LigamentMixin.appliesTo = schema.Ligament
LigamentMixin.createFactory = (env: RdfineEnvironment) => createFactory<Ligament>([AnatomicalStructureMixin, LigamentMixin], { types: [schema.Ligament] }, env)
