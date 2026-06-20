import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app import app
from document_agent import DocumentRAGTool

server = FastAPI(title="Multi-Agent Research API")

# Enable Cross-Origin Resource Sharing (CORS) so your local React interface can communicate safely
server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global runtime cache to hold initialized document RAG tool pointers
active_tools = {}

@server.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Receives a PDF file from the frontend and builds/caches its vector store."""
    try:
        os.makedirs("./uploads", exist_ok=True)
        file_path = f"./uploads/{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Instantiate or pull the cached vector index via disk persistence
        rag_tool = DocumentRAGTool(file_path)
        active_tools["current_session"] = rag_tool
        
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@server.post("/research")
async def run_research(user_request: str = Form(...)):
    """Executes the LangGraph Multi-Agent workflow using the cached document tool."""
    rag_tool = active_tools.get("current_session")
    if not rag_tool:
        raise HTTPException(status_code=400, detail="No active document has been uploaded yet.")
    
    try:
        initial_state = {
            "user_request": user_request,
            "retrieved_context": [],
            "final_report": "",
            "next_step": "supervisor"
        }
        
        final_output = app.invoke(
            initial_state, 
            config={"configurable": {"rag_tool": rag_tool}}
        )
        
        return {"final_report": final_output.get("final_report", "No report generated.")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(server, host="127.0.0.1", port=8000)
    
