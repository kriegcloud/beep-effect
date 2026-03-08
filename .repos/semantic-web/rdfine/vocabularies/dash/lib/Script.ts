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

export interface Script<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  js: string | undefined;
}

export function ScriptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Script & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ScriptClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.literal()
    js: string | undefined;
  }
  return ScriptClass as any
}
ScriptMixin.appliesTo = dash.Script
ScriptMixin.createFactory = (env: RdfineEnvironment) => createFactory<Script>([RdfsResourceMixin, ScriptMixin], { types: [dash.Script] }, env)
