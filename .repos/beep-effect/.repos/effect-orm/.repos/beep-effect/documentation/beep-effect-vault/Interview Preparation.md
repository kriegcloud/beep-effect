
- What I like to do when presented with a feature request, bug or problem to solve
	- Define my assumptions up front
	- validate my assumptions with stakeholders and domain experts

So for creating a retry I will ask
- What is the runtime (this matters because it will ultimately determine which Fetch implementation to use)
	- bun
	- node
	- browser
- Is the remote resource being fetched / posted to internal or third party (will determine If I need to construct a Config)
- Do we 