export function capitalize(str?: undefined | string | null) {
  if (!str || typeof str !== "string") return "";

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace("_", " ");
}

export function toPascalCase(str?: undefined | string | null) {
  if (!str || typeof str !== "string") return "";

  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join("");
}
