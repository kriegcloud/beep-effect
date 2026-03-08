import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { ParameterizableMixin as ShaclParameterizableMixin } from '@rdfine/shacl/lib/Parameterizable';
import { ScriptMixin } from './Script.js';

export interface Action<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.Parameterizable<D>, Dash.Script<D>, rdfine.RdfResource<D> {
  actionGroup: Dash.ActionGroup<D> | undefined;
  actionIconClass: string | undefined;
}

export function ActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Action & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ActionClass extends ScriptMixin(ShaclParameterizableMixin(Resource)) {
    @rdfine.property.resource({ implicitTypes: [dash.ActionGroup] })
    actionGroup: Dash.ActionGroup | undefined;
    @rdfine.property.literal()
    actionIconClass: string | undefined;
  }
  return ActionClass as any
}
ActionMixin.appliesTo = dash.Action
ActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<Action>([ScriptMixin, ShaclParameterizableMixin, ActionMixin], { types: [dash.Action] }, env)
