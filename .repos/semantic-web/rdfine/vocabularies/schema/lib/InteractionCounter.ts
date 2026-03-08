import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StructuredValueMixin } from './StructuredValue.js';

export interface InteractionCounter<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.StructuredValue<D>, rdfine.RdfResource<D> {
  endTime: Date | undefined;
  interactionService: Schema.SoftwareApplication<D> | Schema.WebSite<D> | undefined;
  interactionType: Schema.Action<D> | undefined;
  location: Schema.Place<D> | Schema.PostalAddress<D> | undefined;
  locationLiteral: string | undefined;
  startTime: Date | undefined;
  userInteractionCount: number | undefined;
}

export function InteractionCounterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InteractionCounter & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InteractionCounterClass extends StructuredValueMixin(Resource) {
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    endTime: Date | undefined;
    @rdfine.property.resource()
    interactionService: Schema.SoftwareApplication | Schema.WebSite | undefined;
    @rdfine.property.resource()
    interactionType: Schema.Action | undefined;
    @rdfine.property.resource()
    location: Schema.Place | Schema.PostalAddress | undefined;
    @rdfine.property.literal({ path: schema.location })
    locationLiteral: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#time') })
    startTime: Date | undefined;
    @rdfine.property.literal({ type: Number })
    userInteractionCount: number | undefined;
  }
  return InteractionCounterClass as any
}
InteractionCounterMixin.appliesTo = schema.InteractionCounter
InteractionCounterMixin.createFactory = (env: RdfineEnvironment) => createFactory<InteractionCounter>([StructuredValueMixin, InteractionCounterMixin], { types: [schema.InteractionCounter] }, env)
