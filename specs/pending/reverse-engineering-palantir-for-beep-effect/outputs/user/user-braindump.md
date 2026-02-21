# Braindump

## [Redifining Wealth Management | Citi Wealth at AIPCon 7](https://www.youtube.com/watch?v=IZRCw5WnJm8&list=PLmKm_LhXXgqRbNwHCSD4Wb-lIThcLr5t3&t=103s)

keynote speaker Joe Bonanno gives a presentation on how Citi Wealth has revolutionized several of their core business 
processes using the Palantir Ontology & Foundry. I'm taking notes with keywords & ideas from this talk.

### The wealth management domain
In the wealth management domain firms often have a diverse set of systems to support Sales, Services Teams & Client needs.
Rather than existing in a fragmented landscape backed by manual actions of our Sales, Services & Client teams, Citi Wealth 
is building a software defined approach. Integrating and unifying business lines into a single source of truth.

- Starting with nothing but reference data:
 - Client data.
 - Crm data.
 - Account data.
 - Portfolio data.
 - Asset data.
 - Realtime actions
 - stock splits
 - major life events

![Screenshot From 2026-02-21 00-26-10.png](../../assets/Redifining%20Wealth%20Management%20%7C%20Citi%20Wealth%20at%20AIPCon%207%20images/Screenshot%20From%202026-02-21%2000-26-10.png)

- Customer Operations Center
- Ontologies
- Cards with `Customer Account Management`, `Account Opening` & `Other workflows & Maintenance`

- Client DNA
- Global 
- Automated KYC parsing realtime onboarding workflow with human in the loop review.
- Supporting documents (facs, maybe use kg? ensure documents have prov-0 provenance tracking, rag system to extract key facts from unstructured data.)
- Stream events, operator, client, kyc
- docusign, invoking a ducusign. send out to the client systematical. use signals.
- lift data off credentials (passport, DL, etc)
- cumminacate with client in workflow? chat ui? use gmail integration or other communication channels?
- realtime event log and timeline.
- Global Federated Client Master?
- 