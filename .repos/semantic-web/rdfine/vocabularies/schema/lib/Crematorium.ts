import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';

export interface Crematorium<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, rdfine.RdfResource<D> {
}

export function CrematoriumMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Crematorium & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CrematoriumClass extends CivicStructureMixin(Resource) {
  }
  return CrematoriumClass as any
}
CrematoriumMixin.appliesTo = schema.Crematorium
CrematoriumMixin.createFactory = (env: RdfineEnvironment) => createFactory<Crematorium>([CivicStructureMixin, CrematoriumMixin], { types: [schema.Crematorium] }, env)
