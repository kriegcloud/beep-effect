import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ResourceActionMixin } from './ResourceAction.js';

export interface ExploreAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.ResourceAction<D>, rdfine.RdfResource<D> {
}

export function ExploreActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ExploreAction & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ExploreActionClass extends ResourceActionMixin(Resource) {
  }
  return ExploreActionClass as any
}
ExploreActionMixin.appliesTo = dash.ExploreAction
ExploreActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ExploreAction>([ResourceActionMixin, ExploreActionMixin], { types: [dash.ExploreAction] }, env)
