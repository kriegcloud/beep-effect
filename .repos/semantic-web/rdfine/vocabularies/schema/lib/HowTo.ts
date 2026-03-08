import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface HowTo<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  estimatedCost: Schema.MonetaryAmount<D> | undefined;
  estimatedCostLiteral: string | undefined;
  performTime: Schema.Duration<D> | undefined;
  prepTime: Schema.Duration<D> | undefined;
  step: Array<Schema.CreativeWork<D> | Schema.HowToSection<D> | Schema.HowToStep<D>>;
  stepLiteral: Array<string>;
  steps: Array<Schema.CreativeWork<D> | Schema.ItemList<D>>;
  stepsLiteral: Array<string>;
  supply: Schema.HowToSupply<D> | undefined;
  supplyLiteral: string | undefined;
  tool: Array<Schema.HowToTool<D>>;
  toolLiteral: Array<string>;
  totalTime: Schema.Duration<D> | undefined;
  yield: Schema.QuantitativeValue<D> | undefined;
  yieldLiteral: string | undefined;
}

export function HowToMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HowTo & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HowToClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    estimatedCost: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ path: schema.estimatedCost })
    estimatedCostLiteral: string | undefined;
    @rdfine.property.resource()
    performTime: Schema.Duration | undefined;
    @rdfine.property.resource()
    prepTime: Schema.Duration | undefined;
    @rdfine.property.resource({ values: 'array' })
    step!: Array<Schema.CreativeWork | Schema.HowToSection | Schema.HowToStep>;
    @rdfine.property.literal({ path: schema.step, values: 'array' })
    stepLiteral!: Array<string>;
    @rdfine.property.resource({ values: 'array' })
    steps!: Array<Schema.CreativeWork | Schema.ItemList>;
    @rdfine.property.literal({ path: schema.steps, values: 'array' })
    stepsLiteral!: Array<string>;
    @rdfine.property.resource()
    supply: Schema.HowToSupply | undefined;
    @rdfine.property.literal({ path: schema.supply })
    supplyLiteral: string | undefined;
    @rdfine.property.resource({ values: 'array' })
    tool!: Array<Schema.HowToTool>;
    @rdfine.property.literal({ path: schema.tool, values: 'array' })
    toolLiteral!: Array<string>;
    @rdfine.property.resource()
    totalTime: Schema.Duration | undefined;
    @rdfine.property.resource()
    yield: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.yield })
    yieldLiteral: string | undefined;
  }
  return HowToClass as any
}
HowToMixin.appliesTo = schema.HowTo
HowToMixin.createFactory = (env: RdfineEnvironment) => createFactory<HowTo>([CreativeWorkMixin, HowToMixin], { types: [schema.HowTo] }, env)
