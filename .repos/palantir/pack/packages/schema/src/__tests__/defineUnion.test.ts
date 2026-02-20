/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from "vitest";
import { defineRecord } from "../defineRecord.js";
import { defineUnion } from "../defineUnion.js";
import * as P from "../primitives.js";
import { assertExactKeys, assertTypeEquals } from "./testTypeUtils.js";

describe("defineUnion", () => {
  it("should create a basic union definition with record types", () => {
    const TextRecord = defineRecord("Text", {
      docs: "A text value",
      fields: {
        value: P.String,
      },
    });

    const NumberRecord = defineRecord("Number", {
      docs: "A number value",
      fields: {
        value: P.Double,
      },
    });

    const ValueUnion = defineUnion("Value", {
      docs: "A value union",
      variants: {
        text: TextRecord,
        number: NumberRecord,
      },
    });

    expect(ValueUnion.type).toBe("union");
    expect(ValueUnion.name).toBe("Value");
    expect(ValueUnion.discriminant).toBe("type");
    expect(ValueUnion.variants.text).toEqual({
      type: "ref",
      name: "Text",
      refType: "record",
    });
    expect(ValueUnion.variants.number).toEqual({
      type: "ref",
      name: "Number",
      refType: "record",
    });

    assertExactKeys<typeof ValueUnion.variants, "text" | "number">();
    assertTypeEquals<typeof ValueUnion.variants.text, P.Ref>();
    assertTypeEquals<typeof ValueUnion.variants.number, P.Ref>();
  });

  it("should create a union definition with record types", () => {
    const CircleRecord = defineRecord("Circle", {
      docs: "A circle",
      fields: {
        radius: P.Double,
      },
    });

    const RectangleRecord = defineRecord("Rectangle", {
      docs: "A rectangle",
      fields: {
        width: P.Double,
        height: P.Double,
      },
    });

    const ShapeUnion = defineUnion("Shape", {
      docs: "A shape union",
      variants: {
        circle: CircleRecord,
        rectangle: RectangleRecord,
      },
    });

    expect(ShapeUnion.type).toBe("union");
    expect(ShapeUnion.variants.circle).toEqual({
      type: "ref",
      name: "Circle",
      refType: "record",
    });
    expect(ShapeUnion.variants.rectangle).toEqual({
      type: "ref",
      name: "Rectangle",
      refType: "record",
    });

    assertExactKeys<typeof ShapeUnion.variants, "circle" | "rectangle">();
    assertTypeEquals<typeof ShapeUnion.variants.circle, P.Ref>();
    assertTypeEquals<typeof ShapeUnion.variants.rectangle, P.Ref>();
  });

  it("should create a union with nested unions", () => {
    const PersonRecord = defineRecord("Person", {
      docs: "A person",
      fields: {
        name: P.String,
        age: P.Double,
      },
    });

    const AnimalRecord = defineRecord("Animal", {
      docs: "An animal",
      fields: {
        species: P.String,
      },
    });

    const LivingBeingUnion = defineUnion("LivingBeing", {
      docs: "A living being",
      variants: {
        person: PersonRecord,
        animal: AnimalRecord,
      },
    });

    const MachineRecord = defineRecord("Machine", {
      docs: "A machine",
      fields: {
        model: P.String,
      },
    });

    const EntityUnion = defineUnion("Entity", {
      docs: "An entity union",
      variants: {
        livingBeing: LivingBeingUnion,
        machine: MachineRecord,
      },
    });

    expect(EntityUnion.variants.livingBeing).toEqual({
      type: "ref",
      name: "LivingBeing",
      refType: "union",
    });
    expect(EntityUnion.variants.machine).toEqual({
      type: "ref",
      name: "Machine",
      refType: "record",
    });

    assertExactKeys<typeof EntityUnion.variants, "livingBeing" | "machine">();
    assertTypeEquals<typeof EntityUnion.variants.livingBeing, P.Ref>();
    assertTypeEquals<typeof EntityUnion.variants.machine, P.Ref>();
  });

  it("should have correct union name", () => {
    const Option1Record = defineRecord("Option1", {
      docs: "Option 1",
      fields: {
        value: P.String,
      },
    });

    const Option2Record = defineRecord("Option2", {
      docs: "Option 2",
      fields: {
        value: P.Double,
      },
    });

    const TestUnion = defineUnion("TestUnion", {
      docs: "A test union",
      variants: {
        option1: Option1Record,
        option2: Option2Record,
      },
    });

    expect(TestUnion.name).toBe("TestUnion");
  });

  it("should preserve all item keys", () => {
    const FirstRecord = defineRecord("First", {
      docs: "First option",
      fields: { value: P.String },
    });

    const SecondRecord = defineRecord("Second", {
      docs: "Second option",
      fields: { value: P.Double },
    });

    const ThirdRecord = defineRecord("Third", {
      docs: "Third option",
      fields: { value: P.String },
    });

    const FourthRecord = defineRecord("Fourth", {
      docs: "Fourth option",
      fields: { value: P.Double },
    });

    const MultiOptionUnion = defineUnion("MultiOption", {
      docs: "A multi-option union",
      variants: {
        first: FirstRecord,
        second: SecondRecord,
        third: ThirdRecord,
        fourth: FourthRecord,
      },
    });

    expect(Object.keys(MultiOptionUnion.variants)).toEqual([
      "first",
      "second",
      "third",
      "fourth",
    ]);

    assertExactKeys<
      typeof MultiOptionUnion.variants,
      "first" | "second" | "third" | "fourth"
    >();
  });

  it("should support custom discriminant field", () => {
    const CatRecord = defineRecord("Cat", {
      docs: "A cat",
      fields: {
        meow: P.String,
      },
    });

    const DogRecord = defineRecord("Dog", {
      docs: "A dog",
      fields: {
        bark: P.String,
      },
    });

    const AnimalUnion = defineUnion("Animal", {
      discriminant: "kind",
      docs: "An animal union with custom discriminant",
      variants: {
        cat: CatRecord,
        dog: DogRecord,
      },
    });

    expect(AnimalUnion.discriminant).toBe("kind");
    expect(AnimalUnion.type).toBe("union");
    expect(AnimalUnion.name).toBe("Animal");
    expect(AnimalUnion.variants.cat).toEqual({
      type: "ref",
      name: "Cat",
      refType: "record",
    });
    expect(AnimalUnion.variants.dog).toEqual({
      type: "ref",
      name: "Dog",
      refType: "record",
    });
  });
});
