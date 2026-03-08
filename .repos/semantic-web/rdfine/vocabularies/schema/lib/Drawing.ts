import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Drawing<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function DrawingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Drawing & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DrawingClass extends CreativeWorkMixin(Resource) {
  }
  return DrawingClass as any
}
DrawingMixin.appliesTo = schema.Drawing
DrawingMixin.createFactory = (env: RdfineEnvironment) => createFactory<Drawing>([CreativeWorkMixin, DrawingMixin], { types: [schema.Drawing] }, env)
