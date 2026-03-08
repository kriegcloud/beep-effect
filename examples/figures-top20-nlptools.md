<!--
Query: "Identify the top 20 most important figures identified in these posts"
Config: --provider anthropic --model claude-sonnet-4-5-20250929 --max-iterations 10 --max-llm-calls 200 --nlp-tools
Fixture: test/fixtures/chicago-politics-10k-clean.ndjson (9,977 posts)
Result: 10 iterations, 128 LLM calls used
NLP Tools: ExtractEntities attempted (no PERSON type in wink-nlp), fell back to llm_query_batched
-->

# Top 20 Most Important Figures (with NLP Tools)

Based on analysis of 9,977 posts, the top 20 most important figures are:

1. Brandon Johnson (97 mentions) - Chicago Mayor
2. Donald Trump (71 mentions) - Former U.S. President
3. JB Pritzker (42 mentions) - Illinois Governor
4. Lori Lightfoot (41 mentions) - Former Chicago Mayor
5. Rahm Emanuel (23 mentions) - Former Chicago Mayor
6. Pedro Martinez (22 mentions) - Chicago Public Schools CEO
7. Gregory Bovino (19 mentions)
8. Zohran Mamdani (15 mentions)
9. Jake Sheridan (14 mentions)
10. Larry Snelling (13 mentions) - Chicago Police Superintendent
11. Carlos Ramirez-Rosa (12 mentions) - Chicago Alderman
12. Walter Burnett (11 mentions) - Chicago Alderman
13. Richard M. Daley (11 mentions) - Former Chicago Mayor
14. Michael Madigan (11 mentions) - Former Illinois Speaker
15. Stacy Davis Gates (11 mentions) - Chicago Teachers Union President
16. Alice Yin (10 mentions)
17. Daniel Biss (10 mentions) - Illinois State Senator
18. Harold Washington (10 mentions) - Former Chicago Mayor
19. Anne Hidalgo (9 mentions) - Paris Mayor
20. Anthony Quezada (9 mentions)
