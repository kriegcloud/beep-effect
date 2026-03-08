import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreateActionMixin } from './CreateAction.js';

export interface PhotographAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreateAction<D>, rdfine.RdfResource<D> {
}

export function PhotographActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PhotographAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PhotographActionClass extends CreateActionMixin(Resource) {
  }
  return PhotographActionClass as any
}
PhotographActionMixin.appliesTo = schema.PhotographAction
PhotographActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<PhotographAction>([CreateActionMixin, PhotographActionMixin], { types: [schema.PhotographAction] }, env)
