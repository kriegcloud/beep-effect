import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PeriodicalMixin } from './Periodical.js';

export interface Newspaper<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Periodical<D>, rdfine.RdfResource<D> {
}

export function NewspaperMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Newspaper & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NewspaperClass extends PeriodicalMixin(Resource) {
  }
  return NewspaperClass as any
}
NewspaperMixin.appliesTo = schema.Newspaper
NewspaperMixin.createFactory = (env: RdfineEnvironment) => createFactory<Newspaper>([PeriodicalMixin, NewspaperMixin], { types: [schema.Newspaper] }, env)
