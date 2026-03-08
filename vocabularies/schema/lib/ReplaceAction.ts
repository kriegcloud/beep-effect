import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { UpdateActionMixin } from './UpdateAction.js';

export interface ReplaceAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.UpdateAction<D>, rdfine.RdfResource<D> {
  replacee: Schema.Thing<D> | undefined;
  replacer: Schema.Thing<D> | undefined;
}

export function ReplaceActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReplaceAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReplaceActionClass extends UpdateActionMixin(Resource) {
    @rdfine.property.resource()
    replacee: Schema.Thing | undefined;
    @rdfine.property.resource()
    replacer: Schema.Thing | undefined;
  }
  return ReplaceActionClass as any
}
ReplaceActionMixin.appliesTo = schema.ReplaceAction
ReplaceActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReplaceAction>([UpdateActionMixin, ReplaceActionMixin], { types: [schema.ReplaceAction] }, env)
