import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface SuggestionGenerator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
}

export function SuggestionGeneratorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SuggestionGenerator & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SuggestionGeneratorClass extends RdfsResourceMixin(Resource) {
  }
  return SuggestionGeneratorClass as any
}
SuggestionGeneratorMixin.appliesTo = dash.SuggestionGenerator
SuggestionGeneratorMixin.createFactory = (env: RdfineEnvironment) => createFactory<SuggestionGenerator>([RdfsResourceMixin, SuggestionGeneratorMixin], { types: [dash.SuggestionGenerator] }, env)
