import os
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from state import AgentState

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
    model="gpt-5.2-chat",
    temperature=0.0,
    openai_api_base="https://api.bluesminds.com/v1",
    openai_api_key=api_key
)

# --- Nodes (The Agents) ---

def supervisor_node(state: AgentState) -> dict:
    """Orchestrates workflow routing updates strictly preventing formatting responses."""
    prompt = ChatPromptTemplate.from_template(
        "You are an executive structural supervisor routing manager. You NEVER answer the user's question directly.\n"
        "User Request: {user_request}\n"
        "Current Context Gathered: {retrieved_context}\n"
        "Current Report Draft: {final_report}\n\n"
        "Your ONLY function is to evaluate the state data parameters and return who works next based on these rules:\n"
        "1. If no target document context chunks have been gathered yet, respond with EXACTLY: document_expert\n"
        "2. If context chunks are present but a formal compiled final summary draft does not exist, respond with EXACTLY: writer\n"
        "3. If a finalized structural markdown report has been written, respond with EXACTLY: END\n\n"
        "CRITICAL: Do not provide summaries, conversational text, lists, or markdown styling. Respond with exactly one token string from this list: [document_expert, writer, END]"
    )
    chain = prompt | llm
    response = chain.invoke({
        "user_request": state["user_request"],
        "retrieved_context": state.get("retrieved_context", []),
        "final_report": state.get("final_report", "")
    })
    
    decision = response.content.strip().replace("'", "").replace('"', "")
    
    # COGNITIVE BARRIER FALLBACK: If the LLM slips up and returns an entire resume summary statement, 
    # intercept it here and force a safe route to prevent the LangGraph KeyError crash!
    allowed_routes = ["document_expert", "writer", "END"]
    if decision not in allowed_routes:
        print(f"[System Warning] Intercepted invalid supervisor choice. Enforcing route fallback: 'writer'.")
        decision = "writer"
        
    return {"next_step": decision}

def document_expert_node(state: AgentState, config) -> dict:
    """Executes targeted vector index searches dynamically across whichever PDF is loaded."""
    print("[Agent Update] Document Expert is scanning the dynamic text index...")
    rag_tool = config["configurable"].get("rag_tool")
    
    if rag_tool is None:
        return {"retrieved_context": ["Error: No active document index available."]}
        
    query_string = state["user_request"]
    new_chunks = rag_tool.query(query_string)
    return {"retrieved_context": new_chunks}

def writer_node(state: AgentState) -> dict:
    """Synthesizes raw context arrays into formal Markdown reporting layers."""
    print("[Agent Update] Technical Writer is structuring the final output...")
    prompt = ChatPromptTemplate.from_template(
        "You are an expert Technical Research Writer.\n"
        "Review the raw document snippets gathered: {retrieved_context}\n"
        "Task: Synthesize this data into a comprehensive, beautifully formatted markdown report that fully answers: '{user_request}'"
    )
    chain = prompt | llm
    response = chain.invoke({
        "retrieved_context": state["retrieved_context"],
        "user_request": state["user_request"]
    })
    return {"final_report": response.content}

# --- State Graph Structural Setup ---
workflow = StateGraph(AgentState)

workflow.add_node("supervisor", supervisor_node)
workflow.add_node("document_expert", document_expert_node)
workflow.add_node("writer", writer_node)

workflow.set_entry_point("supervisor")

workflow.add_conditional_edges(
    "supervisor",
    lambda state: state["next_step"],
    {
        "document_expert": "document_expert",
        "writer": "writer",
        "END": END
    }
)

workflow.add_edge("document_expert", "supervisor")
workflow.add_edge("writer", END)

app = workflow.compile()