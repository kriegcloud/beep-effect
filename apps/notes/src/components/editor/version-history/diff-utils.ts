import type { DiffUpdate } from "@platejs/diff";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Struct from "effect/Struct";
export const describeUpdate = ({ newProperties, properties }: DiffUpdate) => {
  const addedProps: string[] = [];
  const removedProps: string[] = [];
  const updatedProps: string[] = [];

  pipe(
    newProperties,
    Struct.keys,
    A.forEach((key) => {
      const oldValue = properties[key];
      const newValue = newProperties[key];

      if (oldValue === undefined) {
        addedProps.push(key);

        return;
      }
      if (newValue === undefined) {
        removedProps.push(key);

        return;
      }

      updatedProps.push(key);
    })
  );

  const descriptionParts: string[] = [];

  if (addedProps.length > 0) {
    descriptionParts.push(`Added ${A.join(", ")(addedProps)}`);
  }
  if (removedProps.length > 0) {
    descriptionParts.push(`Removed ${A.join(", ")(removedProps)}`);
  }
  if (updatedProps.length > 0) {
    A.forEach(updatedProps, (key) => {
      descriptionParts.push(`Updated ${key} from ${properties[key]} to ${newProperties[key]}`);
    });
  }

  return A.join("\n")(descriptionParts);
};
