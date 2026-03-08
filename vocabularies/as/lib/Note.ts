import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ObjectMixin } from './Object.js';

export interface Note<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Object<D>, rdfine.RdfResource<D> {
}

export function NoteMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Note & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class NoteClass extends ObjectMixin(Resource) {
  }
  return NoteClass as any
}
NoteMixin.appliesTo = as.Note
NoteMixin.createFactory = (env: RdfineEnvironment) => createFactory<Note>([ObjectMixin, NoteMixin], { types: [as.Note] }, env)
