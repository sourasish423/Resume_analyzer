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

  const steps = [
    { n: "1", label: "Upload a PDF", done: Boolean(file) || Boolean(text) },
    { n: "2", label: "We extract & summarize it", done: Boolean(text) },
    { n: "3", label: "Ask it anything", done: Boolean(answer) },
  ];

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

        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }

        button, input {
          outline: none;
        }
        button:focus-visible, input:focus-visible {
          outline: 2px solid rgba(56,189,248,0.7);
          outline-offset: 2px;
        }

        /* room for the fixed ask bar + iOS home indicator */
        .bottom-safe {
          padding-bottom: calc(1rem + env(safe-area-inset-bottom));
        }
        .content-safe {
          padding-bottom: calc(7.5rem + env(safe-area-inset-bottom));
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in, .drag-active { animation: none; }
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0f14]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">AI Dashboard</p>
              <h1 className="truncate text-lg font-semibold tracking-tight">
                DocuMind <span className="text-sky-400">AI</span>
              </h1>
            </div>
          </div>

          {text ? (
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Ready
            </span>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
              className="flex-shrink-0 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-colors hover:from-sky-400 hover:to-indigo-400 active:scale-[0.98]"
            >
              Upload
            </button>
          )}
        </div>
      </div>

      <main className="content-safe mx-auto max-w-xl px-4 pt-6">
        {/* Step tracker — vertical rail on mobile, keeps each step legible without crowding */}
        <div className="mb-10 rounded-3xl border border-white/5 bg-[#161a24] p-5">
          <ol className="relative flex flex-col gap-6 pl-1">
            {steps.map((step, idx) => (
              <li key={step.n} className="relative flex items-start gap-4">
                {idx < steps.length - 1 && (
                  <span
                    className={`absolute left-[15px] top-8 h-6 w-px ${
                      step.done ? "bg-emerald-400/30" : "bg-white/10"
                    }`}
                  />
                )}
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    step.done ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-slate-400"
                  }`}
                >
                  {step.done ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.n
                  )}
                </span>
                <span className={`pt-1 text-sm ${step.done ? "text-slate-200" : "text-slate-500"}`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Sections stack with generous breathing room between them */}
        <div className="flex flex-col gap-10">
          <section id="upload-section">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Upload document</p>
              <h2 className="mt-1.5 text-lg font-semibold">PDF Upload</h2>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/5 bg-[#161a24] p-5 shadow-xl">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
                className={`cursor-pointer rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-colors ${
                  isDragging
                    ? "border-sky-400 bg-sky-400/5 drag-active"
                    : "border-white/10 bg-[#0d0f14] active:border-white/20 active:bg-white/[0.02]"
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
                  <span className="font-semibold text-sky-400">Tap to browse</span>
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
                    className="flex-shrink-0 rounded-lg p-2 text-slate-500 transition-colors active:bg-white/5 active:text-slate-300 disabled:opacity-40"
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
                className={`w-full rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-colors active:scale-[0.99] ${
                  loading || !file
                    ? "bg-slate-600/60 opacity-60 cursor-not-allowed"
                    : "bg-gradient-to-r from-sky-500 to-indigo-500 active:from-sky-400 active:to-indigo-400"
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

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">PDF preview</p>
                <h2 className="mt-1.5 text-lg font-semibold">Extracted Text</h2>
              </div>
              {text && (
                <button
                  onClick={() => copyToClipboard(text, "text")}
                  className="flex-shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors active:bg-white/5"
                >
                  {copied === "text" ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            {text ? (
              <div className="scrollbar-thin max-h-80 overflow-y-auto rounded-3xl border border-white/5 bg-[#161a24] p-5 text-sm text-slate-300 shadow-xl">
                <pre className="fade-in whitespace-pre-wrap break-words leading-6 font-sans">{text}</pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/5 bg-[#161a24] px-5 py-10 text-center">
                <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-slate-500">Upload a PDF to see the extracted text preview.</p>
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">AI summary</p>
                <h2 className="mt-1.5 text-lg font-semibold">Document Insights</h2>
              </div>
              {summary && (
                <button
                  onClick={() => copyToClipboard(summary, "summary")}
                  className="flex-shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors active:bg-white/5"
                >
                  {copied === "summary" ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            {loading ? (
              <div className="space-y-3 rounded-3xl border border-white/5 bg-[#161a24] p-5">
                <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-full animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/5" />
              </div>
            ) : summary ? (
              <div className="rounded-3xl border border-white/5 bg-[#161a24] p-5 text-sm text-slate-300 shadow-xl">
                <pre className="fade-in whitespace-pre-wrap break-words leading-6 font-sans">{summary}</pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/5 bg-[#161a24] px-5 py-10 text-center">
                <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-sm text-slate-500">AI summary will appear here after uploading a PDF.</p>
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Chat history</p>
                <h2 className="mt-1.5 text-lg font-semibold">Q&amp;A</h2>
              </div>
            </div>
            {asking ? (
              <div className="flex items-center gap-2 rounded-3xl border border-white/5 bg-[#161a24] p-5 text-sm text-slate-500">
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Thinking through your document...
              </div>
            ) : answer ? (
              <div className="fade-in rounded-3xl border border-white/5 bg-[#161a24] p-5 text-sm text-slate-300 shadow-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Latest answer</p>
                <p className="mt-3 whitespace-pre-wrap break-words leading-6">{answer}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/5 bg-[#161a24] px-5 py-10 text-center">
                <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                </svg>
                <p className="text-sm text-slate-500">Ask a question to get answers from your document.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Fixed ask bar — thumb-reachable, safe-area aware for notched phones */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0d0f14]/95 backdrop-blur-xl">
        <div className="bottom-safe mx-auto max-w-xl px-4 pt-3">
          {!text && (
            <p className="mb-2 text-xs text-slate-500">Upload and process a PDF above before asking questions.</p>
          )}
          {askError && (
            <p className="fade-in mb-2 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">
              <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {askError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={text ? "Ask about the document" : "Upload a PDF first"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleAskKeyDown}
              disabled={asking || !text}
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#161a24] px-4 py-3.5 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleAsk}
              disabled={asking || !question || !text}
              aria-label="Ask document"
              className={`flex flex-shrink-0 items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-colors active:scale-[0.97] ${
                asking || !question || !text
                  ? "bg-slate-600/60 opacity-60 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-violet-500 active:from-indigo-400 active:to-violet-400"
              }`}
            >
              {asking ? (
                <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        </div>
      </div>
    </div>
  );
}

export default App;