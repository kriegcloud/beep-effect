import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { SPARQLSelectExecutableMixin as ShaclSPARQLSelectExecutableMixin } from '@rdfine/shacl/lib/SPARQLSelectExecutable';
import { SPARQLUpdateExecutableMixin as ShaclSPARQLUpdateExecutableMixin } from '@rdfine/shacl/lib/SPARQLUpdateExecutable';
import { SuggestionGeneratorMixin } from './SuggestionGenerator.js';

export interface SPARQLUpdateSuggestionGenerator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.SPARQLSelectExecutable<D>, Shacl.SPARQLUpdateExecutable<D>, Dash.SuggestionGenerator<D>, rdfine.RdfResource<D> {
}

export function SPARQLUpdateSuggestionGeneratorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLUpdateSuggestionGenerator & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SPARQLUpdateSuggestionGeneratorClass extends SuggestionGeneratorMixin(ShaclSPARQLUpdateExecutableMixin(ShaclSPARQLSelectExecutableMixin(Resource))) {
  }
  return SPARQLUpdateSuggestionGeneratorClass as any
}
SPARQLUpdateSuggestionGeneratorMixin.appliesTo = dash.SPARQLUpdateSuggestionGenerator
SPARQLUpdateSuggestionGeneratorMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLUpdateSuggestionGenerator>([SuggestionGeneratorMixin, ShaclSPARQLUpdateExecutableMixin, ShaclSPARQLSelectExecutableMixin, SPARQLUpdateSuggestionGeneratorMixin], { types: [dash.SPARQLUpdateSuggestionGenerator] }, env)
