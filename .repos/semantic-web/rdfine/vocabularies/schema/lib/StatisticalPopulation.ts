import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface StatisticalPopulation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  constrainingProperty: number | undefined;
  numConstraints: number | undefined;
  populationType: RDF.Term | undefined;
}

export function StatisticalPopulationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<StatisticalPopulation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class StatisticalPopulationClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    constrainingProperty: number | undefined;
    @rdfine.property.literal({ type: Number })
    numConstraints: number | undefined;
    @rdfine.property()
    populationType: RDF.Term | undefined;
  }
  return StatisticalPopulationClass as any
}
StatisticalPopulationMixin.appliesTo = schema.StatisticalPopulation
StatisticalPopulationMixin.createFactory = (env: RdfineEnvironment) => createFactory<StatisticalPopulation>([IntangibleMixin, StatisticalPopulationMixin], { types: [schema.StatisticalPopulation] }, env)
