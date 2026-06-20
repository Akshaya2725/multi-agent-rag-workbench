import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { 
  FileText, ArrowUp, Loader2, Menu, X, UploadCloud, CheckCircle
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("disconnected"); 
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (status === "indexed") {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing, status]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      autoUploadFile(selectedFile);
    }
  };

  const autoUploadFile = async (targetFile) => {
    const formData = new FormData();
    formData.append("file", targetFile);

    setIsUploading(true);

    try {
      const response = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok) {
        setStatus("indexed");
        setMessages([]); // Cleared system text box on transition as per previous preference
      } else {
        alert("Upload failed: " + data.detail);
        setFile(null);
      }
    } catch (err) {
      alert("Could not establish connection with the backend API gateway.");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || status !== "indexed" || isProcessing) return;

    const userPrompt = query.trim();
    const currentTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
    
    setMessages(prev => [
      ...prev,
      { id: `user-${Date.now()}`, sender: "user", text: userPrompt, timestamp: currentTimestamp }
    ]);
    
    setQuery("");
    setIsProcessing(true);
    setStatus("running");

    const formData = new FormData();
    formData.append("user_request", userPrompt);

    try {
      const response = await fetch(`${API_BASE}/research`, { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok) {
        setStatus("indexed");
        setMessages(prev => [
          ...prev,
          { 
            id: `agent-${Date.now()}`, 
            sender: "agent", 
            text: data.final_report, 
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) 
          }
        ]);
      } else {
        setStatus("indexed");
        setMessages(prev => [
          ...prev,
          { 
            id: `error-${Date.now()}`, 
            sender: "system", 
            text: `Execution error caught during step routing: ${data.detail}`, 
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) 
          }
        ]);
      }
    } catch (err) {
      alert("Failed processing node pipeline operations.");
      setStatus("indexed");
    } finally {
      setIsProcessing(false);
    }
  };

  // SCREEN 1: Gated Upload Screen
  if (status === "disconnected" && !messages.length) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/background4.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-white/20"></div>

        <div className="relative z-10 text-black font-sans min-h-screen flex flex-col items-center justify-center p-6 antialiased">
          <div className="max-w-xl w-full space-y-10 text-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-black">
                Research on a Document 
              </h1>
              <p className="text-base text-neutral-900 font-medium leading-relaxed">
                Upload a PDF.
              </p>
            </div>

            <div className="pt-2">
              <div 
                onClick={() => !isUploading && fileInputRef.current.click()}
                className={`border border-dashed border-neutral-500 rounded-2xl p-5 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center space-y-2 transition-all ${
                  isUploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-black hover:shadow-md'
                }`}
              >
                <div className="h-16 w-16 rounded-xl bg-white border border-neutral-300 flex items-center justify-center text-neutral-600 shadow-sm">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                  ) : (
                    <UploadCloud className="h-8 w-8 text-black" />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-base font-bold text-black">
                    {isUploading ? "Loading..." : "Choose a file"}
                  </p>
                  <p className="text-sm text-neutral-700 font-mono font-semibold">
                    PDF format only
                  </p>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf" 
                  disabled={isUploading} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: Main Workbench Terminal View
  return (
    <div className="bg-[#FFFFFF] text-black font-sans text-lg min-h-screen flex flex-col antialiased selection:bg-neutral-200">
      
      {/* Header */}
      <header className="border-b border-neutral-300 px-8 py-6 flex flex-shrink-0 justify-between items-center bg-[#FFFFFF] z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-black cursor-pointer"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-black flex items-center justify-center">
              <div className="h-3 w-3 rounded-sm bg-white"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-black">DocExtractor</span>
          </div>
        </div>
      </header>

      {/* Main Framework Layout Container */}
      <div className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto px-4 sm:px-8 relative">
        
        {/* Workspace Sidebar */}
        <aside className={`border-r border-neutral-300 pr-8 py-10 flex flex-col space-y-6 flex-shrink-0 transition-all duration-200 ${
          isSidebarOpen ? 'w-80 opacity-100 block' : 'w-0 opacity-0 hidden'
        }`}>
          <div className="space-y-1">
            <p className="text-sm text-black font-semibold leading-relaxed">The loaded file:</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 w-full p-3 border border-neutral-400 rounded-xl bg-[#FAFAFA]">
              <div className="h-8 w-8 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-black flex-shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-black truncate">
                  {file ? file.name : "Active Cache Document"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setMessages([]);
                setStatus("disconnected");
              }}
              className="w-full py-2.5 border border-neutral-400 hover:border-black text-black text-sm font-bold rounded-xl transition-all cursor-pointer bg-white"
            >
              Clear Data
            </button>
          </div>

          <div className="p-3 rounded-xl border border-neutral-400 bg-[#FAFAFA] text-black text-sm font-mono font-bold flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 flex-shrink-0 text-black" />
            <span>Loaded successfully</span>
          </div>
        </aside>

        {/* Dynamic Conversation Display Field */}
        <main className="flex-1 flex flex-col overflow-hidden bg-solid-black rounded-xl shadow-lg">
          
          <div className="flex-1 overflow-y-auto py-6 px-2 md:px-12 space-y-6 scrollbar-none">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 max-w-3xl mx-auto ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="space-y-1 w-full">
                  <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-neutral-600 uppercase font-bold">
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className={`rounded-xl px-5 py-3.5 leading-relaxed border ${
                    msg.sender === "user"
                      ? "bg-[#FAFAFA] text-black text-base border-neutral-400 font-mono ml-auto max-w-xl font-medium"
                      : msg.sender === "system"
                      ? "bg-[#FAFAFA] text-neutral-900 border-neutral-400 text-base font-mono font-medium"
                      : "text-black text-[17px] border-transparent"
                  }`}>
                    {msg.sender === "user" || msg.sender === "system" ? (
                      <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}></p>
                    ) : (
                      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* In-Progress Loading Status layout row */}
            {isProcessing && (
              <div className="flex gap-4 max-w-3xl mx-auto justify-start">
                <div className="space-y-1">
                  <div className="bg-[#FAFAFA] border border-neutral-400 rounded-xl px-5 py-3 text-base font-mono text-black flex items-center gap-3 font-semibold">
                    <Loader2 className="h-5 w-5 animate-spin text-black" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Footer Form Input Block */}
          <footer className="p-6 bg-white border-t border-neutral-300">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative flex items-center">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-[#FFFFFF] border border-neutral-400 shadow-sm rounded-full py-4 pl-7 pr-16 text-lg text-black placeholder:text-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-[#FAFAFA] disabled:text-neutral-400 transition-all font-sans font-medium"
                placeholder="Ask a question about the document..."
              />
              
              <button 
                type="submit"
                disabled={!query.trim() || isProcessing}
                className="absolute right-4 p-2.5 rounded-full bg-black text-white disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors cursor-pointer flex items-center justify-center shadow-sm"
              >
                <ArrowUp className="h-5 w-5 stroke-[3]" />
              </button>
            </form>
          </footer>

        </main>
      </div>

      <style>{`
        .markdown-body h1 { font-size: 1.8rem; font-weight: 800; color: #000000; margin-top: 1.5rem; margin-bottom: 1rem; border-b: 2px solid #000000; padding-bottom: 0.25rem; }
        .markdown-body h2 { font-size: 1.45rem; font-weight: 700; color: #000000; margin-top: 1.25rem; margin-bottom: 0.75rem; }
        .markdown-body h3 { font-size: 1.25rem; font-weight: 600; color: #000000; margin-top: 1rem; margin-bottom: 0.5rem; }
        .markdown-body p { margin-bottom: 0.85rem; color: #000000; font-size: 1.15rem; line-height: 1.7; font-weight: 500; }
        .markdown-body ul, .markdown-body ol { margin-left: 1.75rem; margin-bottom: 0.85rem; list-style-type: disc; color: #000000; font-size: 1.15rem; font-weight: 500; }
        .markdown-body li { margin-bottom: 0.4rem; line-height: 1.7; font-size: 1.15rem; }
        .markdown-body strong { color: #000000; font-weight: 800; }
        .markdown-body pre { background-color: #FAFAFA; padding: 1.25rem; border-radius: 0.5rem; overflow-x: auto; font-family: monospace; font-size: 1rem; color: #000000; margin: 1.25rem 0; border: 1px solid #B3B3B3; line-height: 1.5; }
      `}</style>
    </div>
  );
}

export default App;