# FreshBooks cache review reference correction

The second conflict integration carries landed main730348fc1f and the Knip
retirement from495903cc18. The FreshBooks package review still references the
original Knip receipt digest f963ef8f0b9446b69f40b77cefbbbbcb3e2487c3e740b7c4ce1de6b624e591ff,
while that receipt now includes the original owner's main-integration section.
Its current tracked digest is aa3b409668e97612e189d3bfe2507ae2a74fa0babb72647208877100ca4310cd.
Both the review and referenced receipt were exact incoming-main bytes.

The publication gate failed on this stale evidence reference. Re-record only
FreshBooks against this immutable source-bound review: the earlier receipt
retains its FreshBooks dependency correction explanation and the main-only
addition describes the root practice workspace. No FreshBooks executable
computation, input, output, environment, dependency, or artifact contract
changes in this corrective record. All other reviews, all coverage floors,
profile, epoch, scope and qualification tuple history must remain exact.
This is evidence-reference repair, not cache qualification or test proof.

The original main repair route is recorded on PR1584 comment6174426150. The
operator's immediate conflict-fix push needs this publication precondition;
this one canonical correction is the authoritative fix, not a floor waiver.
Reversal: revert this corrective commit to restore the prior reference; the
preceding recovery branch preserves the original pushed53d3 head.

This basis becomes immutable when recorded.
