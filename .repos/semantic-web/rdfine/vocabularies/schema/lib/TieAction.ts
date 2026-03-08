import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AchieveActionMixin } from './AchieveAction.js';

export interface TieAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AchieveAction<D>, rdfine.RdfResource<D> {
}

export function TieActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TieAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TieActionClass extends AchieveActionMixin(Resource) {
  }
  return TieActionClass as any
}
TieActionMixin.appliesTo = schema.TieAction
TieActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<TieAction>([AchieveActionMixin, TieActionMixin], { types: [schema.TieAction] }, env)
