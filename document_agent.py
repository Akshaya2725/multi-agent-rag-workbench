import os
import hashlib
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

class DocumentRAGTool:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        # Generate a distinct hash name for the document to create individual db cache folders
        file_hash = hashlib.md5(pdf_path.encode()).hexdigest()[:8]
        self.persist_directory = f"./chroma_db_{file_hash}"
        
        self.retriever = self._initialize_rag()

    def _initialize_rag(self):
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        # Check if the persistent database directory already exists on your local disk
        if os.path.exists(self.persist_directory) and len(os.listdir(self.persist_directory)) > 0:
            print(f"[System Log] Found cached vector index at {self.persist_directory}. Loading instantly...")
            vector_store = Chroma(
                persist_directory=self.persist_directory, 
                embedding_function=embeddings
            )
        else:
            print(f"[System Log] No cached index found. Heavy parsing initiated for {self.pdf_path}...")
            
            # 1. Parse the PDF
            loader = PyPDFLoader(self.pdf_path)
            docs = loader.load()
            
            # 2. Split into digestible chunks
            print(f"[System Log] Chunking {len(docs)} pages into segments...")
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            chunks = text_splitter.split_documents(docs)
            
            # 3. Create the database and save directly to disk
            print(f"[System Log] Calculating local text embeddings and caching index to disk...")
            vector_store = Chroma.from_documents(
                documents=chunks, 
                embedding=embeddings, 
                persist_directory=self.persist_directory
            )
            print(f"[System Log] Vector database successfully cached inside {self.persist_directory}!")
        
        return vector_store.as_retriever(search_kwargs={"k": 5})

    def query(self, search_query: str):
        relevant_docs = self.retriever.invoke(search_query)
        return [doc.page_content for doc in relevant_docs]