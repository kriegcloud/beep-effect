import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreateActionMixin } from './CreateAction.js';

export interface DrawAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreateAction<D>, rdfine.RdfResource<D> {
}

export function DrawActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DrawAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DrawActionClass extends CreateActionMixin(Resource) {
  }
  return DrawActionClass as any
}
DrawActionMixin.appliesTo = schema.DrawAction
DrawActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DrawAction>([CreateActionMixin, DrawActionMixin], { types: [schema.DrawAction] }, env)
