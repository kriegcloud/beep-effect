import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Undo<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function UndoMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Undo & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class UndoClass extends ActivityMixin(Resource) {
  }
  return UndoClass as any
}
UndoMixin.appliesTo = as.Undo
UndoMixin.createFactory = (env: RdfineEnvironment) => createFactory<Undo>([ActivityMixin, UndoMixin], { types: [as.Undo] }, env)
