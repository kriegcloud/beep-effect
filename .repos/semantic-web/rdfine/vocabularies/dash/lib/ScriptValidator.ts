import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { ScriptMixin } from './Script.js';
import { ValidatorMixin as ShaclValidatorMixin } from '@rdfine/shacl/lib/Validator';

export interface ScriptValidator<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Script<D>, Shacl.Validator<D>, rdfine.RdfResource<D> {
}

export function ScriptValidatorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ScriptValidator & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ScriptValidatorClass extends ShaclValidatorMixin(ScriptMixin(Resource)) {
  }
  return ScriptValidatorClass as any
}
ScriptValidatorMixin.appliesTo = dash.ScriptValidator
ScriptValidatorMixin.createFactory = (env: RdfineEnvironment) => createFactory<ScriptValidator>([ShaclValidatorMixin, ScriptMixin, ScriptValidatorMixin], { types: [dash.ScriptValidator] }, env)
