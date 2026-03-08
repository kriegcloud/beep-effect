import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface UseAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
}

export function UseActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UseAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UseActionClass extends ConsumeActionMixin(Resource) {
  }
  return UseActionClass as any
}
UseActionMixin.appliesTo = schema.UseAction
UseActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<UseAction>([ConsumeActionMixin, UseActionMixin], { types: [schema.UseAction] }, env)
