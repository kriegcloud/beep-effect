/**
 * A curated dataset of major world timezones with IANA identifiers for use in scheduling, international applications, and time conversion.
 *
 * @see {@link https://jsonlint.com/datasets/timezones | World Timezones JSON Dataset}
 *
 * @category constants
 * @module \@beep/data/WorldTimezones
 * @since 0.0.0
 */
/**
 * Array of major world timezones with IANA identifiers and UTC offsets.
 *
 * Each entry contains the IANA timezone ID, display name, abbreviation,
 * standard UTC offset, DST offset, and region.
 *
 * @example
 * ```typescript
 * import { WorldTimezones } from "@beep/data"
 *
 * const utc = WorldTimezones.find(tz => tz.id === "UTC")
 * console.log(utc?.abbreviation) // "UTC"
 * console.log(utc?.utc_offset) // "+00:00"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const WorldTimezones = [
  {
    id: "America/New_York",
    name: "Eastern Time",
    abbreviation: "ET",
    utc_offset: "-05:00",
    dst_offset: "-04:00",
    region: "North America",
  },
  {
    id: "America/Chicago",
    name: "Central Time",
    abbreviation: "CT",
    utc_offset: "-06:00",
    dst_offset: "-05:00",
    region: "North America",
  },
  {
    id: "America/Denver",
    name: "Mountain Time",
    abbreviation: "MT",
    utc_offset: "-07:00",
    dst_offset: "-06:00",
    region: "North America",
  },
  {
    id: "America/Los_Angeles",
    name: "Pacific Time",
    abbreviation: "PT",
    utc_offset: "-08:00",
    dst_offset: "-07:00",
    region: "North America",
  },
  {
    id: "America/Anchorage",
    name: "Alaska Time",
    abbreviation: "AKT",
    utc_offset: "-09:00",
    dst_offset: "-08:00",
    region: "North America",
  },
  {
    id: "Pacific/Honolulu",
    name: "Hawaii Time",
    abbreviation: "HST",
    utc_offset: "-10:00",
    dst_offset: null,
    region: "Pacific",
  },
  {
    id: "America/Toronto",
    name: "Eastern Time (Canada)",
    abbreviation: "ET",
    utc_offset: "-05:00",
    dst_offset: "-04:00",
    region: "North America",
  },
  {
    id: "America/Vancouver",
    name: "Pacific Time (Canada)",
    abbreviation: "PT",
    utc_offset: "-08:00",
    dst_offset: "-07:00",
    region: "North America",
  },
  {
    id: "America/Sao_Paulo",
    name: "Brasília Time",
    abbreviation: "BRT",
    utc_offset: "-03:00",
    dst_offset: "-02:00",
    region: "South America",
  },
  {
    id: "America/Buenos_Aires",
    name: "Argentina Time",
    abbreviation: "ART",
    utc_offset: "-03:00",
    dst_offset: null,
    region: "South America",
  },
  {
    id: "America/Mexico_City",
    name: "Central Time (Mexico)",
    abbreviation: "CST",
    utc_offset: "-06:00",
    dst_offset: "-05:00",
    region: "North America",
  },
  {
    id: "Europe/London",
    name: "Greenwich Mean Time",
    abbreviation: "GMT",
    utc_offset: "+00:00",
    dst_offset: "+01:00",
    region: "Europe",
  },
  {
    id: "Europe/Paris",
    name: "Central European Time",
    abbreviation: "CET",
    utc_offset: "+01:00",
    dst_offset: "+02:00",
    region: "Europe",
  },
  {
    id: "Europe/Berlin",
    name: "Central European Time",
    abbreviation: "CET",
    utc_offset: "+01:00",
    dst_offset: "+02:00",
    region: "Europe",
  },
  {
    id: "Europe/Moscow",
    name: "Moscow Time",
    abbreviation: "MSK",
    utc_offset: "+03:00",
    dst_offset: null,
    region: "Europe",
  },
  {
    id: "Europe/Istanbul",
    name: "Turkey Time",
    abbreviation: "TRT",
    utc_offset: "+03:00",
    dst_offset: null,
    region: "Europe",
  },
  {
    id: "Asia/Dubai",
    name: "Gulf Standard Time",
    abbreviation: "GST",
    utc_offset: "+04:00",
    dst_offset: null,
    region: "Asia",
  },
  {
    id: "Asia/Kolkata",
    name: "India Standard Time",
    abbreviation: "IST",
    utc_offset: "+05:30",
    dst_offset: null,
    region: "Asia",
  },
  {
    id: "Asia/Bangkok",
    name: "Indochina Time",
    abbreviation: "ICT",
    utc_offset: "+07:00",
    dst_offset: null,
    region: "Asia",
  },
  {
    id: "Asia/Singapore",
    name: "Singapore Time",
    abbreviation: "SGT",
    utc_offset: "+08:00",
    dst_offset: null,
    region: "Asia",
  },
  {
    id: "Asia/Hong_Kong",
    name: "Hong Kong Time",
    abbreviation: "HKT",
    utc_offset: "+08:00",
    dst_offset: null,
    region: "Asia",
  },
  {
    id: "Asia/Shanghai",
    name: "China Standard Time",
    abbreviation: "CST",
    utc_offset: "+08:00",
    dst_offset: null,
    region: "Asia",
  },
  {
    id: "Asia/Tokyo",
    name: "Japan Standard Time",
    abbreviation: "JST",
    utc_offset: "+09:00",
    dst_offset: null,
    region: "Asia",
  },
  {
    id: "Asia/Seoul",
    name: "Korea Standard Time",
    abbreviation: "KST",
    utc_offset: "+09:00",
    dst_offset: null,
    region: "Asia",
  },
  {
    id: "Australia/Sydney",
    name: "Australian Eastern Time",
    abbreviation: "AET",
    utc_offset: "+10:00",
    dst_offset: "+11:00",
    region: "Oceania",
  },
  {
    id: "Australia/Melbourne",
    name: "Australian Eastern Time",
    abbreviation: "AET",
    utc_offset: "+10:00",
    dst_offset: "+11:00",
    region: "Oceania",
  },
  {
    id: "Australia/Perth",
    name: "Australian Western Time",
    abbreviation: "AWT",
    utc_offset: "+08:00",
    dst_offset: null,
    region: "Oceania",
  },
  {
    id: "Pacific/Auckland",
    name: "New Zealand Time",
    abbreviation: "NZT",
    utc_offset: "+12:00",
    dst_offset: "+13:00",
    region: "Oceania",
  },
  {
    id: "Africa/Cairo",
    name: "Eastern European Time",
    abbreviation: "EET",
    utc_offset: "+02:00",
    dst_offset: null,
    region: "Africa",
  },
  {
    id: "Africa/Johannesburg",
    name: "South Africa Time",
    abbreviation: "SAST",
    utc_offset: "+02:00",
    dst_offset: null,
    region: "Africa",
  },
  {
    id: "UTC",
    name: "Coordinated Universal Time",
    abbreviation: "UTC",
    utc_offset: "+00:00",
    dst_offset: null,
    region: "Global",
  },
] as const;
