import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface Activity<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  atLocation: Prov.Location<D> | undefined;
  endedAtTime: Date | undefined;
  generated: Prov.Entity<D> | undefined;
  invalidated: Prov.Entity<D> | undefined;
  qualifiedAssociation: Prov.Association<D> | undefined;
  qualifiedCommunication: Prov.Communication<D> | undefined;
  qualifiedEnd: Prov.End<D> | undefined;
  qualifiedInfluence: Prov.Influence<D> | undefined;
  qualifiedStart: Prov.Start<D> | undefined;
  qualifiedUsage: Prov.Usage<D> | undefined;
  startedAtTime: Date | undefined;
  used: Prov.Entity<D> | undefined;
  wasAssociatedWith: Prov.Agent<D> | undefined;
  wasEndedBy: Prov.Entity<D> | undefined;
  wasInfluencedBy: Prov.Activity<D> | Prov.Agent<D> | Prov.Entity<D> | undefined;
  wasInformedBy: Prov.Activity<D> | undefined;
  wasStartedBy: Prov.Entity<D> | undefined;
}

export function ActivityMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Activity & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class ActivityClass extends Resource {
    @rdfine.property.resource({ implicitTypes: [prov.Location] })
    atLocation: Prov.Location | undefined;
    @rdfine.property.literal({ type: Date })
    endedAtTime: Date | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Entity] })
    generated: Prov.Entity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Entity] })
    invalidated: Prov.Entity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Association] })
    qualifiedAssociation: Prov.Association | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Communication] })
    qualifiedCommunication: Prov.Communication | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.End] })
    qualifiedEnd: Prov.End | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Influence] })
    qualifiedInfluence: Prov.Influence | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Start] })
    qualifiedStart: Prov.Start | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Usage] })
    qualifiedUsage: Prov.Usage | undefined;
    @rdfine.property.literal({ type: Date })
    startedAtTime: Date | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Entity] })
    used: Prov.Entity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Agent] })
    wasAssociatedWith: Prov.Agent | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Entity] })
    wasEndedBy: Prov.Entity | undefined;
    @rdfine.property.resource()
    wasInfluencedBy: Prov.Activity | Prov.Agent | Prov.Entity | undefined;
    @rdfine.property.resource({ as: [ActivityMixin] })
    wasInformedBy: Prov.Activity | undefined;
    @rdfine.property.resource({ implicitTypes: [prov.Entity] })
    wasStartedBy: Prov.Entity | undefined;
  }
  return ActivityClass as any
}
ActivityMixin.appliesTo = prov.Activity
ActivityMixin.createFactory = (env: RdfineEnvironment) => createFactory<Activity>([ActivityMixin], { types: [prov.Activity] }, env)
