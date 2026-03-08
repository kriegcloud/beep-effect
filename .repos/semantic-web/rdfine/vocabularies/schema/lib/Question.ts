import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CommentMixin } from './Comment.js';

export interface Question<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Comment<D>, rdfine.RdfResource<D> {
  acceptedAnswer: Schema.Answer<D> | Schema.ItemList<D> | undefined;
  answerCount: number | undefined;
  eduQuestionType: string | undefined;
  suggestedAnswer: Schema.Answer<D> | Schema.ItemList<D> | undefined;
}

export function QuestionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Question & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class QuestionClass extends CommentMixin(Resource) {
    @rdfine.property.resource()
    acceptedAnswer: Schema.Answer | Schema.ItemList | undefined;
    @rdfine.property.literal({ type: Number })
    answerCount: number | undefined;
    @rdfine.property.literal()
    eduQuestionType: string | undefined;
    @rdfine.property.resource()
    suggestedAnswer: Schema.Answer | Schema.ItemList | undefined;
  }
  return QuestionClass as any
}
QuestionMixin.appliesTo = schema.Question
QuestionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Question>([CommentMixin, QuestionMixin], { types: [schema.Question] }, env)
