/**
 * All seven continents with key geographic facts.
 *
 * @see {@link https://jsonlint.com/datasets/continents | Continents JSON Dataset}
 *
 * @category constants
 * @module @beep/data/ContinentList
 * @since 0.0.0
 */
/**
 * Array of all seven continents with geographic metadata.
 *
 * Each entry contains a two-letter code, continent name, area, population,
 * country count, largest country, and highest point.
 *
 * @example
 * ```typescript
 * import { ContinentList } from "@beep/data"
 *
 * const asia = ContinentList.find(c => c.code === "AS")
 * console.log(asia?.name) // "Asia"
 * console.log(asia?.highest_point) // "Mount Everest"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ContinentList = [
  {
    code: "AF",
    name: "Africa",
    area_km2: 30370000,
    population: 1400000000,
    countries: 54,
    largest_country: "Algeria",
    highest_point: "Mount Kilimanjaro",
  },
  {
    code: "AN",
    name: "Antarctica",
    area_km2: 14000000,
    population: 1000,
    countries: 0,
    largest_country: null,
    highest_point: "Vinson Massif",
  },
  {
    code: "AS",
    name: "Asia",
    area_km2: 44579000,
    population: 4700000000,
    countries: 49,
    largest_country: "Russia",
    highest_point: "Mount Everest",
  },
  {
    code: "EU",
    name: "Europe",
    area_km2: 10180000,
    population: 750000000,
    countries: 44,
    largest_country: "Russia",
    highest_point: "Mount Elbrus",
  },
  {
    code: "NA",
    name: "North America",
    area_km2: 24709000,
    population: 580000000,
    countries: 23,
    largest_country: "Canada",
    highest_point: "Denali",
  },
  {
    code: "OC",
    name: "Oceania",
    area_km2: 8525989,
    population: 45000000,
    countries: 14,
    largest_country: "Australia",
    highest_point: "Puncak Jaya",
  },
  {
    code: "SA",
    name: "South America",
    area_km2: 17840000,
    population: 430000000,
    countries: 12,
    largest_country: "Brazil",
    highest_point: "Aconcagua",
  },
] as const;
