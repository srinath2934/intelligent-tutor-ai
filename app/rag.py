import json
from pathlib import Path
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

class RAGSystem:
    def __init__(self, index_path: str = "data/tutor_index"):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001"
        )
        self.index_path = Path(index_path)
        self.vector_store = self._load_or_create_vector_store()
    
    def _load_or_create_vector_store(self):
        """Load existing index or create from docs."""
        if self.index_path.exists():
            print("[RAG] Loading existing FAISS index...")
            return FAISS.load_local(
                str(self.index_path), self.embeddings, 
                allow_dangerous_deserialization=True
            )
        
        print("[RAG] Creating new FAISS index...")
        return self._build_index()
    
    def _build_index(self) -> FAISS:
        """Build index from educational docs."""
        docs_path = Path("data/educational_docs.json")
        with open(docs_path) as f:
            raw_docs = json.load(f)
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        documents = []
        for doc in raw_docs:
            chunks = splitter.split_text(doc["content"])
            for chunk in chunks:
                documents.append(Document(
                    page_content=chunk,
                    metadata={"title": doc["title"]}
                ))
        
        vector_store = FAISS.from_documents(documents, self.embeddings)
        vector_store.save_local(str(self.index_path))
        print(f"[RAG] Saved index to {self.index_path}")
        return vector_store
    
    def retrieve(self, query: str, k: int = 3) -> List[Document]:
        """Retrieve relevant docs."""
        return self.vector_store.similarity_search(query, k=k)
