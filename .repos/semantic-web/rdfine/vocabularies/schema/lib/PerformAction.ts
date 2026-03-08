import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlayActionMixin } from './PlayAction.js';

export interface PerformAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PlayAction<D>, rdfine.RdfResource<D> {
  entertainmentBusiness: Schema.EntertainmentBusiness<D> | undefined;
}

export function PerformActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PerformAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PerformActionClass extends PlayActionMixin(Resource) {
    @rdfine.property.resource()
    entertainmentBusiness: Schema.EntertainmentBusiness | undefined;
  }
  return PerformActionClass as any
}
PerformActionMixin.appliesTo = schema.PerformAction
PerformActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<PerformAction>([PlayActionMixin, PerformActionMixin], { types: [schema.PerformAction] }, env)
