import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { TypeMixin } from './Type.js';

export interface RuleType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Type<D>, rdfine.RdfResource<D> {
  isOrWasRuleTypeOf: Rico.Rule<D> | undefined;
}

export function RuleTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RuleType & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RuleTypeClass extends TypeMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.Rule] })
    isOrWasRuleTypeOf: Rico.Rule | undefined;
  }
  return RuleTypeClass as any
}
RuleTypeMixin.appliesTo = rico.RuleType
RuleTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<RuleType>([TypeMixin, RuleTypeMixin], { types: [rico.RuleType] }, env)
