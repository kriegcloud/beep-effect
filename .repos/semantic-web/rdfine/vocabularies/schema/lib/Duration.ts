import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { QuantityMixin } from './Quantity.js';

export interface Duration<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Quantity<D>, rdfine.RdfResource<D> {
}

export function DurationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Duration & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DurationClass extends QuantityMixin(Resource) {
  }
  return DurationClass as any
}
DurationMixin.appliesTo = schema.Duration
DurationMixin.createFactory = (env: RdfineEnvironment) => createFactory<Duration>([QuantityMixin, DurationMixin], { types: [schema.Duration] }, env)
