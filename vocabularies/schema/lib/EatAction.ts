import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ConsumeActionMixin } from './ConsumeAction.js';

export interface EatAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ConsumeAction<D>, rdfine.RdfResource<D> {
}

export function EatActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EatAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EatActionClass extends ConsumeActionMixin(Resource) {
  }
  return EatActionClass as any
}
EatActionMixin.appliesTo = schema.EatAction
EatActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<EatAction>([ConsumeActionMixin, EatActionMixin], { types: [schema.EatAction] }, env)
