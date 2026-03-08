import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LegalServiceMixin } from './LegalService.js';

export interface Notary<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LegalService<D>, rdfine.RdfResource<D> {
}

export function NotaryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Notary & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NotaryClass extends LegalServiceMixin(Resource) {
  }
  return NotaryClass as any
}
NotaryMixin.appliesTo = schema.Notary
NotaryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Notary>([LegalServiceMixin, NotaryMixin], { types: [schema.Notary] }, env)
