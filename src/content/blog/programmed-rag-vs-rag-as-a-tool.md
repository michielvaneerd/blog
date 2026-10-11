---
title: 'Programmed RAG vs RAG as a tool'
description: 'Two different ways to use RAG'
pubDate: 2026-10-11
tags: ["ai", "rag"]
---

RAG (Retrieval Augmenented Generation) kan op verschillende manieren geimplementeerd worden:
- RAG as a tool (Agentic RAG) - Je geeft de retrieval functie als een tool mee aan de LLM. De LLM bepaalt dan zelf wanneer en hoe deze wordt aangeroepen.
- Programmed RAG (Traditional, Linear RAG) - Je programmeert de flow van wanneer en hoe de retrieval wordt gedaan zelf (hard) in de code.

## Programmed RAG

- Elke vraag-antwoord gaat het van te voren geprogrammeerde flow in. Bijv. prompt => embed => retrieve => augment => generate
- Een slechte retrieval geeft meteen slecht antwoord
- Is dus strikt en zeer controleerbaar
- Je moet zelf VEEL werk doen (rephrase).
- Vaak sneller (flow is bekend en strikt).

## RAG as a tool

- De LLM bepaalt zelf wanneer en hoe de retrieve functie wordt aangeroepen. Dus prompt + tool => (LLM tool call * X) => generate
- De LLM doet eigenlijk al het werk
- Als de LLM in eerste instantie slechte retrieval heeft, dan kan het opnieuw een retrieve tool call doen (dus zonder dat er generate is gedaan) met een andere query. Dus antwoord dat uiteindelijk gegeven wordt, kan betere kwaliteit hebben.
- Bij niet-vragen, zoals "Bedankt" kan de LLM zelf bepale dat het niet nodig is om een tool call te doen.
- Kan hogere kosten en latency opleveren, omdat niet ekend is hoeveel tool calls er gedaan qorden.

The core difference between Programmed RAG (often called Traditional or Linear RAG) and RAG as a Tool (Agentic RAG) lies in where the decision-making authority lives. [1, 2] 
In a Programmed RAG system, the orchestration logic is entirely written in hardcoded application code (e.g., Python scripts using LangChain or LlamaIndex). In contrast, RAG as a Tool turns the retrieval pipeline into a function that a Large Language Model (LLM) autonomously decides to call, refine, or skip based on real-time reasoning. [1, 3, 4, 5] 


---

Google AI result:

- https://arxiv.org/html/2601.07711v1#A1 ==> Hierin verschil tussen beide typen + voorbeelden van prompts.
- https://www.progress.com/blogs/agentic-rag-vs-traditional-rag
- https://blog.gitbutler.com/mcp-vs-rag

## Direct Architectural Comparison

| Dimension | Programmed RAG (Traditional) | RAG as a Tool (Agentic) |
|---|---|---|
| Control Flow | Deterministic & Linear. Follows a strict code path: Embed → Retrieve → Augment → Generate. | Dynamic & Iterative. The LLM controls a loop, deciding if it needs to search and when to stop. |
| Query Handling | Passes the raw user query directly to the vector database or search index. | The LLM can decompose complex prompts into sub-queries or rewrite them for better accuracy. |
| Error Recovery | None. If the vector search returns irrelevant results, the LLM generates a poor response from bad context. | Self-Correcting. The LLM evaluates the search results and can choose to run a new search with a modified query. |
| Complexity & Cost | Low latency, low token usage, and very few moving parts. Highly predictable. | Higher latency and token costs due to multiple LLM reasoning cycles before an answer is produced. |
| Integration Pattern | The application wraps the LLM. | The LLM acts as the central router using Tool Calling / Function Calling protocols. |

------------------------------
## Deep Dive: Programmed RAG
In a programmed architecture, the developer pre-determines the exact steps the system will take. [4] 

* How it works: The user types a question. Your backend code immediately passes that text to an embedding model, queries a vector database (like Pinecone or pgvector), grabs the top 3 results, builds a prompt template, and sends it to the LLM. [6] 
* The limitation: The LLM has no say in what data it receives. If a user asks a multi-part question (e.g., "Compare our Q3 sales against our compliance manual guidelines"), a single programmed vector lookup will likely pull a messy mix of pages, failing to answer either part comprehensively. [1, 4] 
* Best use case: High-speed, single-topic Q&A environments, such as a customer support bot answering basic FAQs from product documentation. [4] 

## Deep Dive: RAG as a Tool
When RAG is treated as a tool, the LLM is initialized with an available capability—usually a function defined with a semantic schema (e.g., search_company_knowledge_base(query: str)). [1, 7] 

* How it works: The user asks a complex question. The LLM acts as an autonomous router. It reviews its available tools, realizes it needs external information, and generates a structured tool call. Once the application executes the search and returns the text, the LLM reviews it. If the text is insufficient, the LLM hits the tool again with a different query. [2, 3, 4, 8] 
* The advantage: It enables multi-hop reasoning. The model can query the sales database tool first, analyze the data, and then call the compliance RAG tool to perform the cross-comparison natively. [4, 9] 
* Best use case: Complex, open-ended research workflows, financial analysis spanning multiple documents, or situations where the system must seamlessly pivot between reading documents and executing live APIs. [4, 9] 

------------------------------
If you are trying to decide which pattern to implement for your project, let me know:

* What type of data are you searching through? (e.g., structured SQL databases, unstructured PDFs, live APIs?)
* How complex are the typical user questions?
* Are you optimizing for lowest latency/cost or highest accuracy on hard tasks?

I can provide a tailored code outline or architecture recommendation based on your choices.

[1] [https://blog.gitbutler.com](https://blog.gitbutler.com/mcp-vs-rag)
[2] [https://arxiv.org](https://arxiv.org/html/2601.07711v1)
[3] [https://developer.nvidia.com](https://developer.nvidia.com/blog/traditional-rag-vs-agentic-rag-why-ai-agents-need-dynamic-knowledge-to-get-smarter/)
[4] [https://www.progress.com](https://www.progress.com/blogs/agentic-rag-vs-traditional-rag)
[5] [https://medium.com](https://medium.com/@gaddam.rahul.kumar/agentic-rag-vs-traditional-rag-b1a156f72167)
[6] [https://www.mindstudio.ai](https://www.mindstudio.ai/blog/agentic-rag-vs-standard-rag-multi-layer-retrieval)
[7] [https://www.pontil.com](https://www.pontil.com/blog/rag-vs-tool-calling-which-one-your-agent-actually-needs)
[8] [https://www.linkedin.com](https://www.linkedin.com/posts/allenheltondev_when-should-you-rely-on-rag-vs-making-a-tool-activity-7377378698741673984-IDSy)
[9] [https://medium.com](https://medium.com/@sumeet.pardeshi.online/rag-vs-tool-use-for-llms-the-ultimate-guide-to-choosing-the-right-approach-in-2025-c5c06b0922f6)
