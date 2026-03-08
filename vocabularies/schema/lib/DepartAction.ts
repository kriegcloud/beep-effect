import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MoveActionMixin } from './MoveAction.js';

export interface DepartAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MoveAction<D>, rdfine.RdfResource<D> {
}

export function DepartActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DepartAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DepartActionClass extends MoveActionMixin(Resource) {
  }
  return DepartActionClass as any
}
DepartActionMixin.appliesTo = schema.DepartAction
DepartActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<DepartAction>([MoveActionMixin, DepartActionMixin], { types: [schema.DepartAction] }, env)
