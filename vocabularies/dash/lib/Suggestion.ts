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

export interface Suggestion<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  suggestionConfidence: number | undefined;
  suggestionGroup: RDF.Term | undefined;
}

export function SuggestionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Suggestion & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class SuggestionClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    suggestionConfidence: number | undefined;
    @rdfine.property()
    suggestionGroup: RDF.Term | undefined;
  }
  return SuggestionClass as any
}
SuggestionMixin.appliesTo = dash.Suggestion
SuggestionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Suggestion>([RdfsResourceMixin, SuggestionMixin], { types: [dash.Suggestion] }, env)
