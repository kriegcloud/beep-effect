import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { LinkMixin } from './Link.js';

export interface Mention<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Link<D>, rdfine.RdfResource<D> {
}

export function MentionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Mention & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class MentionClass extends LinkMixin(Resource) {
  }
  return MentionClass as any
}
MentionMixin.appliesTo = as.Mention
MentionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Mention>([LinkMixin, MentionMixin], { types: [as.Mention] }, env)
