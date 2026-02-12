# synthesize refined mvp plan

Created by: Benjamin Oppold
Created time: February 12, 2026 2:12 AM
Last edited by: Benjamin Oppold
Last updated time: February 12, 2026 4:07 AM

My non-technical co-founder cobbled together the attached documents relating to apps/todox. They contain notes, ideas and requirements around the features purpose/capability we want for the todox application. 

Additionally here are some further requirements/ideas:

- AI chat interface, email composer & page creation interface all you lexical text editor component in `apps/todox/src/app/lexical` . This sets us apart from most AI chat applications which use a simple and feature lacking textarea input for their primary input to create AI chat thread messages. using lexical with a rich set of plugins and capabilities sets us apart in terms of user experience. Additionally having AI features baked in to the lexical text editor itself opens up the door way to meta prompting and LLM driven prompting making the AI more likely to produce desirable outputs.
- AI collaborative realtime intuitive context engineering system that even non technical users can understand intuitively. The Todox application is multi-tenanted using GitHub style multi tenancy. The todox application has “Teams” which are groups of users within an organization which can maintain their own permissions. Users (personal org), Organizations & Teams can all have workspaces which can be shared with all users & groups. Workspaces are collections of pages (think notion style), documents & connected data sources which are hierarchical. The items of any kind within a workspace(s) can be added to an AI’s context using a Claude code / codex style system where typing `@` in an editor opens a dropdown list containing possible context items which can be added.
- To further set the todox application from being just another chat app / productivity tool is the use of a sophisticated knowledge graph system using ontology guided LLM prompting to construct rich knowledge graphs out of unstructured workspace items where AI responses can be deterministically validated against the graph to validate responses with prov-0 provenance tracking.
- The todox application maintains a robust & compliant authentication & authorization system (ABAC) allowing for integration with custodian systems.