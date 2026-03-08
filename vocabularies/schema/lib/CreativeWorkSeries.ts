import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';
import { SeriesMixin } from './Series.js';

export interface CreativeWorkSeries<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, Schema.Series<D>, rdfine.RdfResource<D> {
  endDate: Date | undefined;
  issn: string | undefined;
  startDate: Date | undefined;
}

export function CreativeWorkSeriesMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CreativeWorkSeries & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CreativeWorkSeriesClass extends SeriesMixin(CreativeWorkMixin(Resource)) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    endDate: Date | undefined;
    @rdfine.property.literal()
    issn: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    startDate: Date | undefined;
  }
  return CreativeWorkSeriesClass as any
}
CreativeWorkSeriesMixin.appliesTo = schema.CreativeWorkSeries
CreativeWorkSeriesMixin.createFactory = (env: RdfineEnvironment) => createFactory<CreativeWorkSeries>([SeriesMixin, CreativeWorkMixin, CreativeWorkSeriesMixin], { types: [schema.CreativeWorkSeries] }, env)
