import { schema } from './namespace.js';

const values = {
  AllergiesHealthAspect: schema.AllergiesHealthAspect,
  BenefitsHealthAspect: schema.BenefitsHealthAspect,
  CausesHealthAspect: schema.CausesHealthAspect,
  ContagiousnessHealthAspect: schema.ContagiousnessHealthAspect,
  EffectivenessHealthAspect: schema.EffectivenessHealthAspect,
  GettingAccessHealthAspect: schema.GettingAccessHealthAspect,
  HowItWorksHealthAspect: schema.HowItWorksHealthAspect,
  HowOrWhereHealthAspect: schema.HowOrWhereHealthAspect,
  IngredientsHealthAspect: schema.IngredientsHealthAspect,
  LivingWithHealthAspect: schema.LivingWithHealthAspect,
  MayTreatHealthAspect: schema.MayTreatHealthAspect,
  MisconceptionsHealthAspect: schema.MisconceptionsHealthAspect,
  OverviewHealthAspect: schema.OverviewHealthAspect,
  PatientExperienceHealthAspect: schema.PatientExperienceHealthAspect,
  PregnancyHealthAspect: schema.PregnancyHealthAspect,
  PreventionHealthAspect: schema.PreventionHealthAspect,
  PrognosisHealthAspect: schema.PrognosisHealthAspect,
  RelatedTopicsHealthAspect: schema.RelatedTopicsHealthAspect,
  RisksOrComplicationsHealthAspect: schema.RisksOrComplicationsHealthAspect,
  SafetyHealthAspect: schema.SafetyHealthAspect,
  ScreeningHealthAspect: schema.ScreeningHealthAspect,
  SeeDoctorHealthAspect: schema.SeeDoctorHealthAspect,
  SelfCareHealthAspect: schema.SelfCareHealthAspect,
  SideEffectsHealthAspect: schema.SideEffectsHealthAspect,
  StagesHealthAspect: schema.StagesHealthAspect,
  SymptomsHealthAspect: schema.SymptomsHealthAspect,
  TreatmentsHealthAspect: schema.TreatmentsHealthAspect,
  TypesHealthAspect: schema.TypesHealthAspect,
  UsageOrScheduleHealthAspect: schema.UsageOrScheduleHealthAspect,
};

export type HealthAspectEnumeration = typeof values[keyof typeof values];

export default values;
