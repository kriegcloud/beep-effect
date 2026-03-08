import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface ViewAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
}

export function ViewActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ViewAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ViewActionClass extends ConsumeActionMixin(Resource) {
  }
  return ViewActionClass as any
}
ViewActionMixin.appliesTo = schema.ViewAction
ViewActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ViewAction>([ConsumeActionMixin, ViewActionMixin], { types: [schema.ViewAction] }, env)
