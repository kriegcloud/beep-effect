import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Rdf from '@rdfine/rdf';
import { SuggestionMixin } from './Suggestion.js';
import { StatementMixin as RdfStatementMixin } from '@rdfine/rdf/lib/Statement';

export interface GraphUpdate<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Suggestion<D>, rdfine.RdfResource<D> {
  addedTriple: Rdf.Statement<D> | undefined;
  deletedTriple: Rdf.Statement<D> | undefined;
}

export function GraphUpdateMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GraphUpdate & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class GraphUpdateClass extends SuggestionMixin(Resource) {
    @rdfine.property.resource({ as: [RdfStatementMixin] })
    addedTriple: Rdf.Statement | undefined;
    @rdfine.property.resource({ as: [RdfStatementMixin] })
    deletedTriple: Rdf.Statement | undefined;
  }
  return GraphUpdateClass as any
}
GraphUpdateMixin.appliesTo = dash.GraphUpdate
GraphUpdateMixin.createFactory = (env: RdfineEnvironment) => createFactory<GraphUpdate>([SuggestionMixin, GraphUpdateMixin], { types: [dash.GraphUpdate] }, env)
