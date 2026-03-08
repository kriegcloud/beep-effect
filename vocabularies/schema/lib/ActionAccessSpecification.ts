import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface ActionAccessSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  availabilityEnds: Date | undefined;
  availabilityStarts: Date | undefined;
  category: Schema.CategoryCode<D> | Schema.Thing<D> | undefined;
  categoryLiteral: string | undefined;
  eligibleRegion: Schema.GeoShape<D> | Schema.Place<D> | undefined;
  eligibleRegionLiteral: string | undefined;
  expectsAcceptanceOf: Schema.Offer<D> | undefined;
  ineligibleRegion: Schema.GeoShape<D> | Schema.Place<D> | undefined;
  ineligibleRegionLiteral: string | undefined;
  requiresSubscription: Schema.MediaSubscription<D> | undefined;
  requiresSubscriptionLiteral: boolean | undefined;
}

export function ActionAccessSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ActionAccessSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ActionAccessSpecificationClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Date })
    availabilityEnds: Date | undefined;
    @rdfine.property.literal({ type: Date })
    availabilityStarts: Date | undefined;
    @rdfine.property.resource()
    category: Schema.CategoryCode | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.category })
    categoryLiteral: string | undefined;
    @rdfine.property.resource()
    eligibleRegion: Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.eligibleRegion })
    eligibleRegionLiteral: string | undefined;
    @rdfine.property.resource()
    expectsAcceptanceOf: Schema.Offer | undefined;
    @rdfine.property.resource()
    ineligibleRegion: Schema.GeoShape | Schema.Place | undefined;
    @rdfine.property.literal({ path: schema.ineligibleRegion })
    ineligibleRegionLiteral: string | undefined;
    @rdfine.property.resource()
    requiresSubscription: Schema.MediaSubscription | undefined;
    @rdfine.property.literal({ path: schema.requiresSubscription, type: Boolean })
    requiresSubscriptionLiteral: boolean | undefined;
  }
  return ActionAccessSpecificationClass as any
}
ActionAccessSpecificationMixin.appliesTo = schema.ActionAccessSpecification
ActionAccessSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<ActionAccessSpecification>([IntangibleMixin, ActionAccessSpecificationMixin], { types: [schema.ActionAccessSpecification] }, env)
