/**
 * Synthetic office-action fixture shared by the integration test.
 *
 * A small, self-contained office-action text carrying claim 1, a §102
 * anticipation rejection citing one prior-art reference (Smith), and a
 * distinguishing limitation. The distinguishing phrase appears in Title Case
 * (`"A Hinge Coupling The Lid To The Base"`) while the review loop's distinction
 * candidate is lower case, so deterministic alignment takes the case-insensitive
 * `match_lesser` path and the re-slice recovers the original-case substring.
 *
 * Well under the langextract caps (source < 100k, candidate < 4096). Local test
 * helper (not a `src` module).
 */

export const OFFICE_ACTION_FIXTURE =
  "Office Action\n\n" +
  "Claim 1 stands rejected under 35 U.S.C. 102 as anticipated by Smith.\n" +
  "Claim 1 recites: A widget comprising a lid and a base.\n\n" +
  "Applicant respectfully traverses. Smith fails to disclose " +
  "A Hinge Coupling The Lid To The Base, a limitation present in claim 1.\n";

/**
 * Original-case substring the distinction anchor is expected to recover
 * (Title Case in the source; the candidate is lower case — the `match_lesser`
 * re-slice).
 */
export const EXPECTED_DISTINCTION_QUOTE = "A Hinge Coupling The Lid To The Base";

/**
 * Lower-case limitation text the distinction's `missing_limitation` detail is
 * expected to carry (the candidate phrase the loop extracts).
 */
export const EXPECTED_DISTINCTION_LIMITATION = "a hinge coupling the lid to the base";
