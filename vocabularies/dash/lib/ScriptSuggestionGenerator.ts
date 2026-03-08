import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ScriptMixin } from './Script.js';
import { SuggestionGeneratorMixin } from './SuggestionGenerator.js';

export interface ScriptSuggestionGenerator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Script<D>, Dash.SuggestionGenerator<D>, rdfine.RdfResource<D> {
}

export function ScriptSuggestionGeneratorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ScriptSuggestionGenerator & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ScriptSuggestionGeneratorClass extends SuggestionGeneratorMixin(ScriptMixin(Resource)) {
  }
  return ScriptSuggestionGeneratorClass as any
}
ScriptSuggestionGeneratorMixin.appliesTo = dash.ScriptSuggestionGenerator
ScriptSuggestionGeneratorMixin.createFactory = (env: RdfineEnvironment) => createFactory<ScriptSuggestionGenerator>([SuggestionGeneratorMixin, ScriptMixin, ScriptSuggestionGeneratorMixin], { types: [dash.ScriptSuggestionGenerator] }, env)
