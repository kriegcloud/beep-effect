# Cache baseline re-record: `@beep/practice-claude-mod` after merging #1761 head 6774e5d10f

Reviewed 2026-10-14. Taking main's baseline while merging the review-verdict-envelope
head reset this subject; the app still depends on `@beep/law-practice-domain` (added by
the shared-envelope promotion, first review `verdict-promotion-cache-review.md`), which
moves the dependency digest of `#build`, `#check`, `#lint:deprecated-apis` and `#test`.
Commands, outputs, env and cache flags are unchanged; no qualification is granted.
