import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ProductMixin } from './Product.js';

export interface Vehicle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Product<D>, rdfine.RdfResource<D> {
  accelerationTime: Schema.QuantitativeValue<D> | undefined;
  bodyType: string | undefined;
  bodyTypeTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
  callSign: string | undefined;
  cargoVolume: Schema.QuantitativeValue<D> | undefined;
  dateVehicleFirstRegistered: Date | undefined;
  driveWheelConfiguration: string | undefined;
  driveWheelConfigurationTerm: Schema.DriveWheelConfigurationValue | undefined;
  'emissionsCO2': number | undefined;
  fuelCapacity: Schema.QuantitativeValue<D> | undefined;
  fuelConsumption: Schema.QuantitativeValue<D> | undefined;
  fuelEfficiency: Schema.QuantitativeValue<D> | undefined;
  fuelType: string | undefined;
  fuelTypeTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
  knownVehicleDamages: string | undefined;
  meetsEmissionStandard: string | undefined;
  meetsEmissionStandardTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
  mileageFromOdometer: Schema.QuantitativeValue<D> | undefined;
  modelDate: Date | undefined;
  numberOfAirbags: number | string | undefined;
  numberOfAxles: Schema.QuantitativeValue<D> | undefined;
  numberOfAxlesLiteral: number | undefined;
  numberOfDoors: Schema.QuantitativeValue<D> | undefined;
  numberOfDoorsLiteral: number | undefined;
  numberOfForwardGears: Schema.QuantitativeValue<D> | undefined;
  numberOfForwardGearsLiteral: number | undefined;
  numberOfPreviousOwners: Schema.QuantitativeValue<D> | undefined;
  numberOfPreviousOwnersLiteral: number | undefined;
  payload: Schema.QuantitativeValue<D> | undefined;
  productionDate: Date | undefined;
  purchaseDate: Date | undefined;
  seatingCapacity: Schema.QuantitativeValue<D> | undefined;
  seatingCapacityLiteral: number | undefined;
  speed: Schema.QuantitativeValue<D> | undefined;
  steeringPosition: Schema.SteeringPositionValue | undefined;
  tongueWeight: Schema.QuantitativeValue<D> | undefined;
  trailerWeight: Schema.QuantitativeValue<D> | undefined;
  vehicleConfiguration: string | undefined;
  vehicleEngine: Schema.EngineSpecification<D> | undefined;
  vehicleIdentificationNumber: string | undefined;
  vehicleInteriorColor: string | undefined;
  vehicleInteriorType: string | undefined;
  vehicleModelDate: Date | undefined;
  vehicleSeatingCapacity: Schema.QuantitativeValue<D> | undefined;
  vehicleSeatingCapacityLiteral: number | undefined;
  vehicleSpecialUsage: string | undefined;
  vehicleSpecialUsageTerm: Schema.CarUsageType | undefined;
  vehicleTransmission: string | undefined;
  vehicleTransmissionTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
  weightTotal: Schema.QuantitativeValue<D> | undefined;
  wheelbase: Schema.QuantitativeValue<D> | undefined;
}

export function VehicleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Vehicle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VehicleClass extends ProductMixin(Resource) {
    @rdfine.property.resource()
    accelerationTime: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    bodyType: string | undefined;
    @rdfine.property({ path: schema.bodyType })
    bodyTypeTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
    @rdfine.property.literal()
    callSign: string | undefined;
    @rdfine.property.resource()
    cargoVolume: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    dateVehicleFirstRegistered: Date | undefined;
    @rdfine.property.literal()
    driveWheelConfiguration: string | undefined;
    @rdfine.property({ path: schema.driveWheelConfiguration })
    driveWheelConfigurationTerm: Schema.DriveWheelConfigurationValue | undefined;
    @rdfine.property.literal({ type: Number })
    'emissionsCO2': number | undefined;
    @rdfine.property.resource()
    fuelCapacity: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    fuelConsumption: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    fuelEfficiency: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    fuelType: string | undefined;
    @rdfine.property({ path: schema.fuelType })
    fuelTypeTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
    @rdfine.property.literal()
    knownVehicleDamages: string | undefined;
    @rdfine.property.literal()
    meetsEmissionStandard: string | undefined;
    @rdfine.property({ path: schema.meetsEmissionStandard })
    meetsEmissionStandardTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
    @rdfine.property.resource()
    mileageFromOdometer: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    modelDate: Date | undefined;
    @rdfine.property.literal()
    numberOfAirbags: number | string | undefined;
    @rdfine.property.resource()
    numberOfAxles: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfAxles, type: Number })
    numberOfAxlesLiteral: number | undefined;
    @rdfine.property.resource()
    numberOfDoors: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfDoors, type: Number })
    numberOfDoorsLiteral: number | undefined;
    @rdfine.property.resource()
    numberOfForwardGears: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfForwardGears, type: Number })
    numberOfForwardGearsLiteral: number | undefined;
    @rdfine.property.resource()
    numberOfPreviousOwners: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.numberOfPreviousOwners, type: Number })
    numberOfPreviousOwnersLiteral: number | undefined;
    @rdfine.property.resource()
    payload: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    productionDate: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    purchaseDate: Date | undefined;
    @rdfine.property.resource()
    seatingCapacity: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.seatingCapacity, type: Number })
    seatingCapacityLiteral: number | undefined;
    @rdfine.property.resource()
    speed: Schema.QuantitativeValue | undefined;
    @rdfine.property()
    steeringPosition: Schema.SteeringPositionValue | undefined;
    @rdfine.property.resource()
    tongueWeight: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    trailerWeight: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    vehicleConfiguration: string | undefined;
    @rdfine.property.resource()
    vehicleEngine: Schema.EngineSpecification | undefined;
    @rdfine.property.literal()
    vehicleIdentificationNumber: string | undefined;
    @rdfine.property.literal()
    vehicleInteriorColor: string | undefined;
    @rdfine.property.literal()
    vehicleInteriorType: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    vehicleModelDate: Date | undefined;
    @rdfine.property.resource()
    vehicleSeatingCapacity: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.vehicleSeatingCapacity, type: Number })
    vehicleSeatingCapacityLiteral: number | undefined;
    @rdfine.property.literal()
    vehicleSpecialUsage: string | undefined;
    @rdfine.property({ path: schema.vehicleSpecialUsage })
    vehicleSpecialUsageTerm: Schema.CarUsageType | undefined;
    @rdfine.property.literal()
    vehicleTransmission: string | undefined;
    @rdfine.property({ path: schema.vehicleTransmission })
    vehicleTransmissionTerm: RDF.NamedNode | Schema.QualitativeValue | undefined;
    @rdfine.property.resource()
    weightTotal: Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    wheelbase: Schema.QuantitativeValue | undefined;
  }
  return VehicleClass as any
}
VehicleMixin.appliesTo = schema.Vehicle
VehicleMixin.createFactory = (env: RdfineEnvironment) => createFactory<Vehicle>([ProductMixin, VehicleMixin], { types: [schema.Vehicle] }, env)
