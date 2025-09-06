import { useState, useMemo } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // optional: read API base from env, fallback to localhost:5000
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000",
    []
  );

  const sentimentClass = useMemo(() => {
    const s = (sentiment || "").toLowerCase();
    if (s.includes("positive")) return "badge badge--positive";
    if (s.includes("negative")) return "badge badge--negative";
    if (s.includes("neutral")) return "badge badge--neutral";
    if (s.includes("irrelevant")) return "badge badge--irrelevant";
    return "badge";
  }, [sentiment]);

  const handleAnalyze = async () => {
    setErrorMsg("");
    if (!text.trim()) {
      setErrorMsg("Please enter some text.");
      return;
    }

    setLoading(true);
    setSentiment("");

    try {
      const res = await fetch(`${apiBase}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Request failed");
      }
      setSentiment(data.sentiment);
    } catch (err) {
      setErrorMsg(err.message || "Could not connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setSentiment("");
    setErrorMsg("");
  };

  return (
    <div className="page">
      <header className="header">
        <h1 className="title">Sentiment Analysis</h1>
        <p className="subtitle">Type text and get a predicted sentiment.</p>
      </header>

      <main className="card">
        <label htmlFor="inputText" className="label">
          Enter text
        </label>
        <textarea
          id="inputText"
          className="textarea"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., I love playing Borderlands, it’s amazing!"
        />

        <div className="actions">
          <button
            className="btn"
            onClick={handleAnalyze}
            disabled={loading}
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? "Analyzing…" : "Analyze Sentiment"}
          </button>
          <button
            className="btn btn--ghost"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>

        {errorMsg && (
          <div className="alert" role="alert">
            {errorMsg}
          </div>
        )}

        {sentiment && (
          <div className="result">
            <span className="result__label">Predicted Sentiment:</span>
            <span className={sentimentClass}>{sentiment}</span>
          </div>
        )}
      </main>

      <footer className="footer">
        <small>
          Backend expected at <code>{apiBase}</code>. Set{" "}
          <code>VITE_API_BASE</code> to change.
        </small>
      </footer>
    </div>
  );
}

export default App;
