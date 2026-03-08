import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Sculpture<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function SculptureMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Sculpture & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SculptureClass extends CreativeWorkMixin(Resource) {
  }
  return SculptureClass as any
}
SculptureMixin.appliesTo = schema.Sculpture
SculptureMixin.createFactory = (env: RdfineEnvironment) => createFactory<Sculpture>([CreativeWorkMixin, SculptureMixin], { types: [schema.Sculpture] }, env)
