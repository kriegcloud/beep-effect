import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { skos } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Skos from '../index.js';

export interface ConceptScheme<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  hasTopConcept: Skos.Concept<D> | undefined;
}

export function ConceptSchemeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ConceptScheme & RdfResourceCore> & Base {
  @rdfine.namespace(skos)
  class ConceptSchemeClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [skos.Concept] })
    hasTopConcept: Skos.Concept | undefined;
  }
  return ConceptSchemeClass as any
}
ConceptSchemeMixin.appliesTo = skos.ConceptScheme
ConceptSchemeMixin.createFactory = (env: RdfineEnvironment) => createFactory<ConceptScheme>([ConceptSchemeMixin], { types: [skos.ConceptScheme] }, env)
