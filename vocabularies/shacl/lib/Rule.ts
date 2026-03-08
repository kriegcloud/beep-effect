import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface Rule<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  condition: Sh.Shape<D> | undefined;
}

export function RuleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Rule & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class RuleClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [sh.Shape] })
    condition: Sh.Shape | undefined;
  }
  return RuleClass as any
}
RuleMixin.appliesTo = sh.Rule
RuleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Rule>([RdfsResourceMixin, RuleMixin], { types: [sh.Rule] }, env)
