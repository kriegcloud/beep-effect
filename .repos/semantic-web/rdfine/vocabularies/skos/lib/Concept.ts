import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { skos } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Skos from '../index.js';

export interface Concept<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  semanticRelation: Array<Skos.Concept<D>>;
  topConceptOf: Array<Skos.ConceptScheme<D>>;
}

export function ConceptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Concept & RdfResourceCore> & Base {
  @rdfine.namespace(skos)
  class ConceptClass extends Resource {
    @rdfine.property.resource({ values: 'array', as: [ConceptMixin] })
    semanticRelation!: Array<Skos.Concept>;
    @rdfine.property.resource({ values: 'array', implicitTypes: [skos.ConceptScheme] })
    topConceptOf!: Array<Skos.ConceptScheme>;
  }
  return ConceptClass as any
}
ConceptMixin.appliesTo = skos.Concept
ConceptMixin.createFactory = (env: RdfineEnvironment) => createFactory<Concept>([ConceptMixin], { types: [skos.Concept] }, env)
