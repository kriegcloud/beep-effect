/**
 * Scratch ontology builder POC.
 *
 * Promotion/removal note:
 * This module is an experiment only. Durable ontology metadata that stays tied
 * to semantic-web validation should re-enter through `@beep/semantic-web`;
 * pure schema annotation helpers should re-enter through a foundation modeling
 * package only after this scratch shape has real consumers.
 */

export * from "./ontology-builder/index.js";
export * from "./example-ontology.js";
