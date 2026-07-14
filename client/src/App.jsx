import axios from "axios";
import { useRef, useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [askError, setAskError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState("");
  const fileInputRef = useRef(null);

  // ---- backend calls: unchanged ----
  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData);
      setText(response.data.text);
      setSummary(response.data.summary);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError("We couldn't process that PDF. Check the file and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question || !text || asking) return;
    setAsking(true);
    setAskError("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload/ask`, {
        question: question,
        text: text,
      });
      setAnswer(response.data.answer);
    } catch (err) {
      console.error("Ask failed:", err);
      setAskError("We couldn't get an answer that time. Try asking again.");
    } finally {
      setAsking(false);
    }
  };
  // ---- end backend calls ----

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      return;
    }
    setUploadError("");
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    pickFile(dropped);
  };

  const clearFile = () => {
    setFile(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAskKeyDown = (e) => {
    if (e.key === "Enter" && !asking && question && text) {
      handleAsk();
    }
  };

  const copyToClipboard = async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0f14] text-white">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp 0.35s ease-out; }

        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(56,189,248,0.35); }
          100% { box-shadow: 0 0 0 10px rgba(56,189,248,0); }
        }
        .drag-active { animation: pulseRing 1.2s infinite; }

        .scrollbar-thin::-webkit-scrollbar { width: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }

        @media (prefers-reduced-motion: reduce) {
          .fade-in, .drag-active { animation: none; }
        }
      `}</style>

      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0f14]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">AI Dashboard</p>
              <h1 className="text-2xl font-semibold tracking-tight">
                DocuMind <span className="text-sky-400">AI</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {text && (
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Document ready
              </span>
            )}
            <button
              type="button"
              onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-sky-400 hover:to-indigo-400 hover:shadow-indigo-500/40 active:scale-[0.98]"
            >
              Upload PDF
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <section id="upload-section" className="rounded-[2rem] border border-white/5 bg-[#161a24] p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Upload Document</p>
                  <h2 className="mt-2 text-xl font-semibold">PDF Upload</h2>
                </div>
              </div>

              <div className="space-y-4">
                {/* Drag & drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
                    isDragging
                      ? "border-sky-400 bg-sky-400/5 drag-active"
                      : "border-white/10 bg-[#0d0f14] hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <input
                    id="pdf-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => pickFile(e.target.files[0])}
                    className="hidden"
                  />
                  <svg className="mx-auto mb-3 h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
                  </svg>
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-sky-400">Click to browse</span> or drag a PDF here
                  </p>
                  <p className="mt-1 text-xs text-slate-500">PDF files only</p>
                </div>

                {file && (
                  <div className="fade-in flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d0f14] px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={clearFile}
                      disabled={loading}
                      aria-label="Remove selected file"
                      className="flex-shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300 disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {uploadError && (
                  <p className="fade-in flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    {uploadError}
                  </p>
                )}

                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className={`w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition active:scale-[0.99] ${
                    loading || !file
                      ? "bg-slate-600/60 opacity-60 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 hover:shadow-indigo-500/40"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Uploading &amp; analyzing...
                    </span>
                  ) : (
                    "Upload PDF"
                  )}
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/5 bg-[#161a24] p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">PDF Preview</p>
                  <h2 className="mt-2 text-xl font-semibold">Extracted Text</h2>
                </div>
                {text && (
                  <button
                    onClick={() => copyToClipboard(text, "text")}
                    className="flex-shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                  >
                    {copied === "text" ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
              <div className="scrollbar-thin max-h-[36rem] overflow-y-auto rounded-3xl border border-white/5 bg-[#0d0f14] p-5 text-sm text-slate-300">
                {text ? (
                  <pre className="fade-in whitespace-pre-wrap break-words leading-6 font-sans">{text}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <svg className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-500">Upload a PDF to see the extracted text preview.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <section className="rounded-[2rem] border border-white/5 bg-[#161a24] p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">AI Summary</p>
                  <h2 className="mt-2 text-xl font-semibold">Document Insights</h2>
                </div>
                {summary && (
                  <button
                    onClick={() => copyToClipboard(summary, "summary")}
                    className="flex-shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                  >
                    {copied === "summary" ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
              <div className="min-h-[18rem] rounded-3xl border border-white/5 bg-[#0d0f14] p-5 text-sm text-slate-300">
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/5" />
                    <div className="h-3 w-full animate-pulse rounded-full bg-white/5" />
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/5" />
                  </div>
                ) : summary ? (
                  <pre className="fade-in whitespace-pre-wrap break-words leading-6 font-sans">{summary}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <svg className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-slate-500">AI summary will appear here after uploading a PDF.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/5 bg-[#161a24] p-6 shadow-xl">
              <div className="mb-6 flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Chat History</p>
                  <h2 className="mt-2 text-xl font-semibold">Q&amp;A</h2>
                </div>
              </div>
              <div className="min-h-[18rem] rounded-3xl border border-white/5 bg-[#0d0f14] p-5 text-sm text-slate-300">
                {asking ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Thinking through your document...
                  </div>
                ) : answer ? (
                  <div className="fade-in space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Latest Answer</p>
                      <p className="mt-3 whitespace-pre-wrap break-words leading-6">{answer}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <svg className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                    </svg>
                    <p className="text-slate-500">Ask a question to get answers from your document.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="sticky bottom-0 rounded-[2rem] border border-white/5 bg-[#161a24] p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Ask the Document</p>
                  <h2 className="mt-2 text-xl font-semibold">Chat Input</h2>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {!text && (
                  <p className="text-xs text-slate-500">Upload and process a PDF above before asking questions.</p>
                )}
                {askError && (
                  <p className="fade-in flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    {askError}
                  </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder={text ? "Ask a question about the document" : "Upload a PDF first"}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleAskKeyDown}
                    disabled={asking || !text}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0f14] px-5 py-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    onClick={handleAsk}
                    disabled={asking || !question || !text}
                    className={`rounded-2xl px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition active:scale-[0.99] sm:flex-shrink-0 ${
                      asking || !question || !text
                        ? "bg-slate-600/60 opacity-60 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 hover:shadow-violet-500/40"
                    }`}
                  >
                    {asking ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Thinking...
                      </span>
                    ) : (
                      "Ask Document"
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;