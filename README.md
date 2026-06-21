# Multi-Agent Research Assistant

A Multi-Agent Retrieval-Augmented Generation (RAG) system designed to perform intelligent document analysis, semantic retrieval, and research synthesis through agent collaboration.

The system combines document-grounded retrieval with specialized AI agents that work together to generate context-aware and research-focused responses. Unlike traditional single-agent chatbots, this architecture distributes responsibilities across multiple agents, improving scalability, contextual understanding, and response quality.

---
# Test

![Test](images/backend1.jpg)
# Overview

The Multi-Agent Research Assistant processes uploaded documents, retrieves relevant information using vector search, and synthesizes responses through a collaborative agent workflow.

The system is designed to:

* Analyze uploaded PDF documents
* Retrieve semantically relevant content
* Perform document-grounded reasoning
* Synthesize information into structured responses
* Support research-oriented question answering

---

# System Architecture

```text
                         User Query
                              │
                              ▼
               ┌──────────────────────────┐
               │ Supervisor Agent / Router│
               └──────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼

┌────────────────────┐      ┌────────────────────┐
│ Document Specialist │      │ Web/Research Agent│
│ Agent              │      │                   │
│ Vector Retrieval   │      │ External Research │
│ Context Extraction │      │ Knowledge Synthesis│
└────────────────────┘      └────────────────────┘
          │                               │
          └───────────────┬───────────────┘
                          ▼

               ┌────────────────────┐
               │ Synthesizer Agent  │
               │ Report Generation  │
               └────────────────────┘
                          │
                          ▼
                    Final Report
```

---

# Features

* Multi-Agent Architecture
* Retrieval-Augmented Generation (RAG)
* PDF Document Upload and Processing
* Semantic Search using Vector Embeddings
* ChromaDB Vector Database Integration
* Context-Aware Question Answering
* Agent-Based Information Synthesis
* State-Driven Workflow Management
* Frontend and Backend Integration
* Scalable Research Assistant Framework

---

# Agent Responsibilities

## Supervisor Agent

Acts as the orchestration layer of the system.

Responsibilities:

* Accept user queries
* Route tasks to specialized agents
* Manage workflow execution
* Coordinate response generation

---

## Document Specialist Agent

Responsible for document-grounded retrieval.

Responsibilities:

* Document chunk retrieval
* Semantic similarity search
* Context extraction
* Knowledge grounding

---

## Web/Research Agent

Responsible for external knowledge acquisition and synthesis.

Responsibilities:

* Research augmentation
* Information gathering
* Context enrichment
* Comparative analysis

---

## Synthesizer Agent

Generates the final response.

Responsibilities:

* Merge outputs from multiple agents
* Resolve information overlap
* Generate structured reports
* Produce coherent final answers

---

# Execution Workflow

```text
User Query
    │
    ▼
Supervisor Agent
    │
    ├──► Document Specialist Agent
    │         │
    │         ▼
    │   Retrieved Context
    │
    └──► Research Agent
              │
              ▼
      External Knowledge
              │
              ▼
       Synthesizer Agent
              │
              ▼
         Final Response
```

---

# Technology Stack

## Programming Language

* Python

## Frameworks and Libraries

* LangChain
* ChromaDB
* Sentence Transformers

## Embedding Model

* all-MiniLM-L6-v2

## Database

* ChromaDB Vector Store

## Frontend

* Custom Frontend Interface

## Backend

* Python Server Architecture

---

# Project Structure

```text
multi-agent-research-assistant/
│
├── frontend/                 # Frontend interface
├── uploads/                  # Uploaded PDF documents
│
├── app.py                    # Main application entry point
├── server.py                 # Backend server logic
├── state.py                  # Shared workflow state
├── document_agent.py         # Document retrieval agent
│
├── chroma_db_*               # ChromaDB vector databases
│
├── .env                      # Environment variables
├── .gitignore
└── README.md
```

---

# Sample Query

```text
Explain the exact structural difference between the Multi-Head Attention mechanism and a standard Scaled Dot-Product Attention block as outlined in the paper. Include how the scaling factor $\frac{1}{\sqrt{d_k}}$ prevents vanishing gradients during training
```

---

# Sample Output Screenshots

```markdown
![Backend connection](images/backend1.jpg)

![frontend connection](images/frontend.jpg)

![outputt](images/op2.jpg)

![loading the uploaded pdf](images/op1.jpg)

![chatbox to ask a question about the uploaded pdf](images/op3.jpg)

![Asking a question:](images/op4.jpg)

![Generated Report](images/op5.jpg)

![](images/op6.jpg)

![](images/op7.jpg)

![](images/op8.jpg)

![](images/op9.jpg)

![](images/op10.jpg)

![](images/op11.jpg)

![](images/op12.jpg)
```

---

# Future Enhancements

* Memory-Augmented Agents
* Citation Generation Agent
* Multi-Document Retrieval
* Real-Time Web Search
* Agent Evaluation Metrics
* Research Paper Recommendation Engine
* Production-Ready API Integration

---

# Applications

* Academic Research Assistance
* Literature Review Automation
* Research Paper Analysis
* Knowledge Discovery
* Technical Report Generation
* Enterprise Knowledge Management
* Educational Learning Systems
