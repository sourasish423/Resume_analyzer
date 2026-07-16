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

  const steps = [
    { label: "Upload", done: Boolean(file) || Boolean(text) },
    { label: "Extract", done: Boolean(text) },
    { label: "Summarize", done: Boolean(summary) },
    { label: "Ask", done: Boolean(answer) },
  ];
  const activeStepIdx = steps.reduce((acc, s, i) => (s.done ? i + 1 : acc), 0);

  const suggestions = ["What are the key takeaways?", "Summarize the main risks"];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0b0e15] text-slate-100 md:flex-row">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp 0.35s ease-out; }

        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.3); }
          100% { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
        }
        .drag-active { animation: pulseRing 1.2s infinite; }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-bar {
          background: linear-gradient(90deg, rgba(245,158,11,0.15) 25%, rgba(245,158,11,0.6) 50%, rgba(245,158,11,0.15) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }

        button, input {
          outline: none;
        }
        button:focus-visible, input:focus-visible {
          outline: 2px solid rgba(245,158,11,0.6);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in, .drag-active, .shimmer-bar { animation: none; }
        }
      `}</style>

      {/* Sidebar: brand + step rail. Horizontal strip on mobile, vertical rail on md+ */}
      <aside className="flex-shrink-0 border-b border-white/5 bg-[#10141d] px-5 py-4 md:w-56 md:border-b-0 md:border-r md:px-6 md:py-8">
        <div className="mb-6 flex items-center gap-2.5 md:mb-12">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            DocuMind <span className="text-amber-400">AI</span>
          </span>
        </div>

        <ol className="flex items-center gap-5 overflow-x-auto md:flex-col md:items-stretch md:gap-7 md:overflow-visible">
          {steps.map((step, idx) => {
            const isCurrent = idx === activeStepIdx && !step.done;
            return (
              <li key={step.label} className="relative flex flex-shrink-0 items-center gap-3">
                {idx < steps.length - 1 && (
                  <span
                    className={`absolute left-[13px] top-7 hidden h-7 w-px md:block ${
                      step.done ? "bg-amber-400/30" : "bg-white/10"
                    }`}
                  />
                )}
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                    step.done
                      ? "bg-amber-400 text-[#151a24]"
                      : isCurrent
                      ? "border border-amber-400/60 text-amber-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {step.done ? (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={`hidden text-xs font-medium md:inline ${
                    step.done ? "text-slate-300" : isCurrent ? "text-amber-400" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-[#0b0e15]/95 px-5 py-4 backdrop-blur-xl">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Document Analyzer</p>
            <h1 className="mt-1 truncate text-sm font-semibold text-slate-100">
              {file ? file.name : "No document yet"}
            </h1>
          </div>
          {loading ? (
            <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-medium text-amber-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Processing
            </span>
          ) : text ? (
            <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Connected
            </span>
          ) : null}
        </div>

        <main className="scrollbar-thin flex-1 overflow-y-auto px-5 py-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {/* Document card: dropzone, or extracted text + summary once processed */}
            <section className="rounded-3xl border border-white/5 bg-[#141922] shadow-xl">
              {!text ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
                    isDragging ? "border-amber-400/60 bg-amber-400/5 drag-active" : "border-white/10"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => pickFile(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-amber-400/40 text-amber-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-medium text-slate-200">Drop your PDF here</p>
                    <p className="mt-1 text-sm text-slate-500">or select a file from your computer</p>
                  </div>

                  {file ? (
                    <div className="fade-in flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d1017] px-4 py-3 text-left">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        onClick={clearFile}
                        disabled={loading}
                        aria-label="Remove selected file"
                        className="flex-shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300 disabled:opacity-40"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-[#151a24] transition-colors hover:bg-amber-300 active:scale-[0.98]"
                    >
                      Browse files
                    </button>
                  )}

                  {uploadError && (
                    <p className="fade-in flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-300">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      {uploadError}
                    </p>
                  )}

                  {file && (
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      className={`w-full max-w-sm rounded-full px-5 py-3 text-sm font-semibold transition-colors active:scale-[0.98] ${
                        loading
                          ? "cursor-not-allowed bg-slate-600/40 text-slate-400"
                          : "bg-amber-400 text-[#151a24] hover:bg-amber-300"
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          Analyzing document...
                        </span>
                      ) : (
                        "Upload & analyze"
                      )}
                    </button>
                  )}

                  <p className="text-xs text-slate-600">PDF only</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                        Extracted Text
                      </p>
                    </div>
                    <div className="scrollbar-thin max-h-48 overflow-y-auto rounded-2xl bg-[#0d1017] p-4 text-sm leading-6 text-slate-400">
                      <pre className="whitespace-pre-wrap break-words font-sans">{text}</pre>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Summary</p>
                    </div>
                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div className="shimmer-bar h-full w-full" />
                        </div>
                        <p className="text-xs text-slate-500">Generating summary...</p>
                      </div>
                    ) : (
                      <p className="fade-in whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                        {summary}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Chat card: Q&A */}
            <section className="flex flex-col rounded-3xl border border-white/5 bg-[#141922] shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                  </svg>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Ask about this document
                </p>
              </div>

              <div className="flex flex-col gap-3 p-6">
                {asking ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Thinking through your document...
                  </div>
                ) : answer ? (
                  <div className="fade-in flex flex-col gap-3">
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-white/5 px-4 py-2.5 text-sm text-slate-200">
                      {question}
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md border-l-2 border-amber-400 bg-[#0d1017] px-4 py-3 text-sm leading-6 text-slate-300">
                      {answer}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                    </svg>
                    <p className="text-sm text-slate-500">Ask a question to get answers from your document.</p>
                    {text && (
                      <div className="flex flex-wrap justify-center gap-2 pt-1">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => setQuestion(s)}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-amber-400/40 hover:text-amber-300"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {askError && (
                  <p className="fade-in flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-300">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    {askError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-white/5 p-4">
                <input
                  type="text"
                  placeholder={text ? "Ask about this document" : "Upload a PDF first"}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleAskKeyDown}
                  disabled={asking || !text}
                  className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#0d1017] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  onClick={handleAsk}
                  disabled={asking || !question || !text}
                  aria-label="Send question"
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors active:scale-[0.96] ${
                    asking || !question || !text
                      ? "cursor-not-allowed bg-slate-600/40 text-slate-500"
                      : "bg-amber-400 text-[#151a24] hover:bg-amber-300"
                  }`}
                >
                  {asking ? (
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-6 6m6-6l6 6" />
                    </svg>
                  )}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;