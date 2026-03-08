import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { rico } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Rico from '../index.js';
import { ThingMixin } from './Thing.js';

export interface Rule<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rico.Thing<D>, rdfine.RdfResource<D> {
  hasOrHadRuleType: Rico.RuleType<D> | undefined;
  hasOrHadTitle: Rico.Title<D> | undefined;
  history: RDF.Literal | undefined;
  isOrWasEnforcedBy: Rico.Agent<D> | undefined;
  isOrWasExpressedBy: Rico.RecordResource<D> | undefined;
  isRuleAssociatedWith: Rico.Thing<D> | undefined;
  issuedBy: Rico.Agent<D> | undefined;
  regulatesOrRegulated: Rico.Thing<D> | undefined;
  title: RDF.Literal | undefined;
}

export function RuleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Rule & RdfResourceCore> & Base {
  @rdfine.namespace(rico)
  class RuleClass extends ThingMixin(Resource) {
    @rdfine.property.resource({ implicitTypes: [rico.RuleType] })
    hasOrHadRuleType: Rico.RuleType | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Title] })
    hasOrHadTitle: Rico.Title | undefined;
    @rdfine.property()
    history: RDF.Literal | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    isOrWasEnforcedBy: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.RecordResource] })
    isOrWasExpressedBy: Rico.RecordResource | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    isRuleAssociatedWith: Rico.Thing | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Agent] })
    issuedBy: Rico.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [rico.Thing] })
    regulatesOrRegulated: Rico.Thing | undefined;
    @rdfine.property()
    title: RDF.Literal | undefined;
  }
  return RuleClass as any
}
RuleMixin.appliesTo = rico.Rule
RuleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Rule>([ThingMixin, RuleMixin], { types: [rico.Rule] }, env)
