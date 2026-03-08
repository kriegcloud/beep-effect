import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Concept<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Thing<D>, rdfine.RdfResource<D> {
}

export function ConceptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Concept & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class ConceptClass extends ThingMixin(Resource) {
  }
  return ConceptClass as any
}
ConceptMixin.appliesTo = rico.Concept
ConceptMixin.createFactory = (env: RdfineEnvironment) => createFactory<Concept>([ThingMixin, ConceptMixin], { types: [rico.Concept] }, env)
