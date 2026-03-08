import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface ReadAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
}

export function ReadActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReadAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReadActionClass extends ConsumeActionMixin(Resource) {
  }
  return ReadActionClass as any
}
ReadActionMixin.appliesTo = schema.ReadAction
ReadActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReadAction>([ConsumeActionMixin, ReadActionMixin], { types: [schema.ReadAction] }, env)
