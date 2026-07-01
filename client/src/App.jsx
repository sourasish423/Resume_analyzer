import axios from "axios";
import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const response = await axios.post("http://localhost:5000/api/upload", formData);
      setText(response.data.text);
      setSummary(response.data.summary);
    } catch (err) {
      console.error("Upload failed:", err);
      // optionally show user feedback here
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question || !text || asking) return;
    setAsking(true);
    try {
      const response = await axios.post("http://localhost:5000/api/upload/ask", {
        question: question,
        text: text,
      });
      setAnswer(response.data.answer);
    } catch (err) {
      console.error("Ask failed:", err);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0f14] text-white">
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

          <button
            type="button"
            onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-sky-400 hover:to-indigo-400"
          >
            Upload PDF
          </button>
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

              <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0f14] px-4 py-3 text-sm text-slate-200 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white/5 file:text-slate-300 hover:file:bg-white/10"
                  />
                  <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className={`w-full sm:w-auto rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition ${loading || !file ? 'bg-slate-600/60 opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400'}`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      'Upload PDF'
                    )}
                  </button>
                </div>
                {file && <p className="text-sm text-sky-400 italic">Selected file: {file.name}</p>}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/5 bg-[#161a24] p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">PDF Preview</p>
                  <h2 className="mt-2 text-xl font-semibold">Extracted Text</h2>
                </div>
              </div>
              <div className="max-h-[36rem] overflow-y-auto rounded-3xl border border-white/5 bg-[#0d0f14] p-5 text-sm text-slate-300">
                {text ? (
                  <pre className="whitespace-pre-wrap break-words leading-6">{text}</pre>
                ) : (
                  <p className="text-slate-500">Upload a PDF to see the extracted text preview.</p>
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
              </div>
              <div className="min-h-[18rem] rounded-3xl border border-white/5 bg-[#0d0f14] p-5 text-sm text-slate-300">
                {summary ? (
                  <pre className="whitespace-pre-wrap break-words leading-6">{summary}</pre>
                ) : (
                  <p className="text-slate-500">AI summary will appear here after uploading a PDF.</p>
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
                {answer ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Latest Answer</p>
                      <p className="mt-3 whitespace-pre-wrap break-words leading-6">{answer}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Ask a question to get answers from your document.</p>
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

              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Ask a question about the document"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={asking}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0f14] px-5 py-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
                <button
                  onClick={handleAsk}
                  disabled={asking || !question}
                  className={`rounded-2xl px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition ${asking || !question ? 'bg-slate-600/60 opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400'}`}
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
                    'Ask Document'
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;