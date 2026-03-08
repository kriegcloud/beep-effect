import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AllocateActionMixin } from './AllocateAction.js';

export interface AssignAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AllocateAction<D>, rdfine.RdfResource<D> {
}

export function AssignActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AssignAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AssignActionClass extends AllocateActionMixin(Resource) {
  }
  return AssignActionClass as any
}
AssignActionMixin.appliesTo = schema.AssignAction
AssignActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<AssignAction>([AllocateActionMixin, AssignActionMixin], { types: [schema.AssignAction] }, env)
