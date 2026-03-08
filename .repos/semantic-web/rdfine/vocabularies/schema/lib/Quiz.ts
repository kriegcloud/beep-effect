import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LearningResourceMixin } from './LearningResource.js';

export interface Quiz<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LearningResource<D>, rdfine.RdfResource<D> {
}

export function QuizMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Quiz & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class QuizClass extends LearningResourceMixin(Resource) {
  }
  return QuizClass as any
}
QuizMixin.appliesTo = schema.Quiz
QuizMixin.createFactory = (env: RdfineEnvironment) => createFactory<Quiz>([LearningResourceMixin, QuizMixin], { types: [schema.Quiz] }, env)
