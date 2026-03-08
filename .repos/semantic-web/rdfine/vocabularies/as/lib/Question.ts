import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { IntransitiveActivityMixin } from './IntransitiveActivity.js';

export interface Question<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.IntransitiveActivity<D>, rdfine.RdfResource<D> {
  anyOf: As.Link<D> | As.Object<D> | undefined;
  oneOf: As.Link<D> | As.Object<D> | undefined;
}

export function QuestionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Question & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class QuestionClass extends IntransitiveActivityMixin(Resource) {
    @rdfine.property.resource()
    anyOf: As.Link | As.Object | undefined;
    @rdfine.property.resource()
    oneOf: As.Link | As.Object | undefined;
  }
  return QuestionClass as any
}
QuestionMixin.appliesTo = as.Question
QuestionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Question>([IntransitiveActivityMixin, QuestionMixin], { types: [as.Question] }, env)
