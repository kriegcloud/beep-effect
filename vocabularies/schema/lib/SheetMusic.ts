import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface SheetMusic<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function SheetMusicMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SheetMusic & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SheetMusicClass extends CreativeWorkMixin(Resource) {
  }
  return SheetMusicClass as any
}
SheetMusicMixin.appliesTo = schema.SheetMusic
SheetMusicMixin.createFactory = (env: RdfineEnvironment) => createFactory<SheetMusic>([CreativeWorkMixin, SheetMusicMixin], { types: [schema.SheetMusic] }, env)
