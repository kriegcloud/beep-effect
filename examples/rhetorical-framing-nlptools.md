<!--
Query: "Analyze the rhetorical framing of the top 5 most-discussed politicians in these posts.
       For each politician, identify the dominant predicates, descriptors, and sentiment patterns
       used when discussing them. Compare how different sources frame the same politician."
Config: --provider anthropic --model claude-sonnet-4-5-20250929 --max-iterations 10 --max-llm-calls 200 --nlp-tools
Fixture: test/fixtures/chicago-politics-10k-clean.ndjson (9,977 posts)
Result: 10 iterations, 20 LLM calls used
NLP Tools: Available but not used (regex was appropriate for mechanical name-matching)
-->

# RHETORICAL FRAMING ANALYSIS: TOP 5 MOST-DISCUSSED POLITICIANS

## EXECUTIVE SUMMARY

Analysis of 9,977 posts from 461 sources reveals the five most-discussed politicians:

1. **Brandon Johnson** (2,069 posts, 82 sources)
2. **Donald Trump** (609 posts, 61 sources)  
3. **J.B. Pritzker** (156 posts, 26 sources)
4. **Lori Lightfoot** (142 posts, 18 sources)
5. **Rahm Emanuel** (105 posts, 15 sources)

---

## 1. BRANDON JOHNSON

**Dominant Predicates**: "proposes," "retreats," "deflects," "compromises," "faces rejection"—verbs suggesting reactive rather than proactive leadership.

**Key Descriptors**: "rookie mayor," "politically weakened," "embattled," "struggling," dependent on advisors ("shadow mayor" Jason Lee).

**Sentiment Patterns**: Overwhelmingly critical to skeptical across sources. Coverage emphasizes legislative defeats, narrow votes (27-23, 30-18), and forced compromises. Even progressive policy wins (Gaza ceasefire, labor agreements) are qualified by controversy.

**Source Comparisons**:
- **Heather Cherone**: Process-focused insider reporting. Uses frequent "BREAKING" alerts and meticulous vote counts to document dysfunction without explicit editorial commentary. Drama through documentation.
- **Chicago Tribune**: Explicitly critical, accountability journalism. Uses evaluative language ("embattled," "controversial") and emphasizes taxpayer costs and broken promises. Where Cherone documents dysfunction, Tribune editorializes about incompetence.
- **Consensus**: Both sources portray Johnson as overwhelmed by office, defined by what he fails to accomplish rather than achievements. His political identity centers on insufficiency and retreat.

---

## 2. DONALD TRUMP

**Dominant Predicates**: "fighting," "attacking," "threatening," "stripping," "questioning"—aggressive, confrontational verbs across all coverage.

**Key Descriptors**: Extremely polarized by source:
- Progressive/mainstream: "twice-impeached convicted felon," "insurrectionist," associated with "chaos" and authoritarianism
- Conservative: "unfairly targeted," "vindicated," outsider fighting corruption

**Sentiment Patterns**: Most polarized of all politicians analyzed. Progressive sources frame him as existential threat to democracy; conservative sources present persecution/vindication narrative. Unique pattern: his legal troubles, personal grievances, and policies become inseparable—he's simultaneously candidate, defendant, and cultural symbol.

**Source Comparisons**:
- **Chicago Tribune/WBEZ**: Frame Trump as external antagonist to Chicago, emphasizing threats to sanctuary city status, immigrant communities, and local officials. Heavy focus on federal-local conflicts and constitutional concerns.
- **Conservative outlets**: Reframe same actions as justified responses to corruption and elite capture.
- **Consensus**: All sources agree Trump is consequential and electorally dominant; fundamental disagreement on whether this represents legitimate democracy or authoritarianism. Agency attribution differs dramatically—critics see active threats, supporters see defensive responses.

---

## 3. J.B. PRITZKER

**Dominant Predicates**: "stands firm," "resists," "directs," "sues," "blocks"—verbs suggesting institutional authority and resistance to Trump.

**Key Descriptors**: "Democratic Governor," portrayed as fiscally responsible, Trump resistance figure, skeptical of Johnson, party establishment leader.

**Sentiment Patterns**: Most neutral-reportorial treatment of all five politicians. Mixed/polarized by context:
- From Trump/Republicans: Hostile ("should be jailed," targeted in lawsuits)
- From progressive activists: Critical (immigrant healthcare pause)
- From establishment Democrats: Supportive (fundraising with Obama)

**Source Comparisons**:
- **WBEZ**: Neutral-reportorial, emphasizing political process and relationships. Covers both achievements (disability wage reform) and challenges (budget tensions, Johnson conflicts). Frames Pritzker as competent political operator with potential national ambitions.
- **Chicago Tribune**: Similar neutral approach with focus on inter-governmental tensions and resistance to Trump administration.
- **Consensus**: Sources agree on Pritzker as strategically calculating, fiscally strict, and effective Trump foil. Most balanced coverage—neither hagiography nor opposition research.

---

## 4. LORI LIGHTFOOT

**Dominant Predicates**: "clashing," "battling," "facing off," "taking on"—consistently confrontational verbs.

**Key Descriptors**: "combative," "thin-skinned," "politically isolated," "reform-minded but ineffective at coalition-building."

**Sentiment Patterns**: Consistent negative-to-critical tone across sources. Unique retrospective consensus on tenure failure. Coverage emphasizes her confrontational style became the story, overshadowing policy.

**Source Comparisons**:
- **Chicago Tribune**: Emphasizes political isolation and declining approval. Frames confrontational style as self-inflicted wounds through poor relationship management.
- **Heather Cherone**: More process-oriented but still conflict-focused, particularly around ethics reforms and institutional battles.
- **Consensus**: Remarkable agreement across ideologically diverse sources. Lightfoot consistently described through oppositional relationships—always fighting *against* something rather than building *toward* vision. Retrospective narrative presents her as principled but unable to translate reform vision into sustainable governance. Historic first-round elimination treated as almost inevitable given accumulated conflicts.

---

## 5. RAHM EMANUEL

**Dominant Predicates**: "backs," "supports," "advises," "hosts" (fundraisers)—verbs suggesting influence from behind scenes rather than direct executive action.

**Key Descriptors**: "pragmatic operator," "establishment figure," "king-maker," "influential despite lacking office."

**Sentiment Patterns**: Mixed and context-dependent. Progressive sources critical of his mayoral record and current influence; establishment sources treat him as elder statesman. Unique pattern: past tenure evaluated alongside current influence.

**Source Comparisons**:
- **Heather Cherone/Chicago Tribune**: Emphasize his continued political relevance through fundraising, endorsements, and advisory roles. Frame him as establishment power broker.
- **Progressive outlets (The Triibe)**: Critical of his legacy (school closures, police accountability failures) and ongoing influence.
- **Consensus**: All sources agree Emanuel remains consequential in Chicago politics despite lacking office. Disagreement centers on whether his pragmatic approach represents competent governance or harmful centrism. His behind-scenes influence provides contrast to Johnson's visible struggles—experienced operator vs. overwhelmed rookie.

---

## KEY CROSS-CUTTING FINDINGS

### Framing Patterns Across All Politicians:

**1. CONFLICT-CENTRIC COVERAGE**: All five politicians predominantly framed through adversarial relationships—budget battles, institutional conflicts, inter-governmental tensions. Collaborative governance receives minimal attention.

**2. PREDICATES REVEAL POWER DYNAMICS**:
- Johnson: reactive weakness ("proposes," "retreats," "deflects")
- Trump: aggressive disruption ("attacks," "threatens," "strips")
- Lightfoot: combative isolation ("battles," "clashes")
- Pritzker: institutional authority ("stands firm," "resists," "directs")
- Emanuel: behind-scenes influence ("backs," "supports," "advises")

**3. SOURCE IDEOLOGY MATTERS MOST FOR TRUMP**: Most dramatic framing differences occur with Trump (existential threat vs. vindicated outsider). For local politicians, differences are more stylistic (process-focused vs. accountability-focused) than ideological.

**4. TEMPORAL FRAMING DIFFERS**:
- Past politicians (Lightfoot, Emanuel): retrospective consensus narratives
- Current politicians (Johnson): documentation of ongoing struggles
- Trump: perpetual present-tense controversy transcending traditional temporal frames

**5. SENTIMENT POLARIZATION HIERARCHY**:
- Most polarized: Trump (incompatible narratives by ideology)
- Most negative consensus: Johnson (consistent criticism across sources)
- Most neutral: Pritzker (balanced reportorial treatment)
- Retrospective negative consensus: Lightfoot (settled narrative of failure)
- Context-dependent: Emanuel (progressive critique vs. establishment respect)

### Source-Specific Approaches:

- **Chicago Tribune**: Accountability journalism emphasizing fiscal concerns, governance failures, and taxpayer impacts
- **Heather Cherone**: Process-focused insider reporting with detailed vote counts; drama through documentation
- **WBEZ**: Neutral-reportorial coverage of political procedures and inter-governmental relationships
- **Progressive outlets**: Emphasize accountability, social justice concerns, and critique of establishment figures
- **Conservative outlets**: Frame Trump/right-leaning figures as reform-minded; emphasize persecution narratives

---

## METHODOLOGY

- **Data**: 9,977 posts from 461 sources (November 2024 - April 2025)
- **Analysis**: Sentiment analysis of 379 sample posts; comparative source analysis of 4-5 major outlets per politician
- **Focus**: Identification of predicates, descriptors, sentiment patterns, thematic emphasis, and source-specific framing differences
