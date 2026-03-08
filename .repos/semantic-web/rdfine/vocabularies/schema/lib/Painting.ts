import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Painting<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function PaintingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Painting & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PaintingClass extends CreativeWorkMixin(Resource) {
  }
  return PaintingClass as any
}
PaintingMixin.appliesTo = schema.Painting
PaintingMixin.createFactory = (env: RdfineEnvironment) => createFactory<Painting>([CreativeWorkMixin, PaintingMixin], { types: [schema.Painting] }, env)
