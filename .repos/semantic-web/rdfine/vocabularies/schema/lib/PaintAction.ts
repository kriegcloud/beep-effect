import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreateActionMixin } from './CreateAction.js';

export interface PaintAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreateAction<D>, rdfine.RdfResource<D> {
}

export function PaintActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PaintAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PaintActionClass extends CreateActionMixin(Resource) {
  }
  return PaintActionClass as any
}
PaintActionMixin.appliesTo = schema.PaintAction
PaintActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<PaintAction>([CreateActionMixin, PaintActionMixin], { types: [schema.PaintAction] }, env)
