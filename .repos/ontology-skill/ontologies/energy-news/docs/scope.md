# Energy News Ontology — Scope

## Domain Description

An ontology for mapping the energy news media landscape as observed through
Bluesky social media. Models the intersection of news media activity (who
shares what, where) and the energy domain (topics, technologies, organizations,
geography) to enable structured analysis of energy discourse.

## Intended Use Cases

- Classify and browse energy news by topic, source, and geography
- Analyze which publications and authors cover which energy sectors
- Track coverage patterns across energy topics over time
- Compare coverage volume between energy sectors (renewables vs. fossil, etc.)
- Identify key organizations and projects mentioned in energy news

## Data Source

- **Primary**: Bluesky posts from energy-focused feeds and authors, collected
  via SkyGent into a local SQLite store (~14.7K posts, 3.7K authors)
- **Scope of data**: Post text, embedded article URLs with title/description,
  author handles, hashtags, engagement metrics, timestamps
- **Not available**: Full article body text, structured NER output

## In Scope

- Energy topics and technology taxonomy (solar, wind, nuclear, oil, gas, etc.)
- News publications and media sources (by domain)
- Bluesky authors/accounts that share energy news
- Articles (as referenced by embedded links — URL, title, description)
- Bluesky posts (the sharing act itself, with metadata)
- Geographic scope of coverage (countries, regions)
- Organizations mentioned in the energy space
- Curated Bluesky feeds as collection/channel entities

## Out of Scope

- Full article text parsing and NER extraction
- Sentiment analysis or stance detection
- Financial data (stock prices, deal values)
- Detailed project specifications (capacity, MW, timelines)
- User engagement prediction
- Non-energy content that leaks in from general accounts
- Authentication or user identity beyond public bsky handles

## Constraints

- **Profile**: OWL 2 DL (lightweight; primarily taxonomic with some object properties)
- **Size**: Small (~50-100 classes, ~20 properties)
- **Serialization**: Turtle (.ttl)
- **Upper ontology**: Minimal BFO alignment where natural; not forced
- **Naming**: CamelCase classes, camelCase properties, English labels
