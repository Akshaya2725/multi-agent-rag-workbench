from typing import TypedDict, List

class AgentState(TypedDict):
    user_request: str
    retrieved_context: List[str]
    final_report: str
    next_step: str