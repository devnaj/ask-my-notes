import { useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function showSources(sources) {
  if (!sources || sources.length === 0) return "";
  const names = sources.map((s) => `${s.source} p.${s.page}`);
  return [...new Set(names)].join(" · ");
}

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  function addMessage(msg) {
    setMessages((old) => [...old, msg]);
  }

  async function askQuestion() {
    if (!question.trim() || loading) return;
    const myQuestion = question;
    addMessage({ role: "user", text: myQuestion });
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: myQuestion }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Server error");
      }

      addMessage({ role: "bot", text: data.answer, sources: data.sources });
    } catch (err) {
      addMessage({
        role: "bot",
        text: `Error: ${err.message}. Make sure the FastAPI server is running on port 8000.`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>📚 Ask My Notes</h1>
      <div className="chat">
        {messages.length === 0 && (
          <p className="hint">Ask anything about your notes 👇</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <p>{m.text}</p>
            {m.sources && m.sources.length > 0 && (
              <small>📄 {showSources(m.sources)}</small>
            )}
          </div>
        ))}
        {loading && <div className="msg bot">Thinking… 🤔</div>}
      </div>
      <div className="ask-box">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          placeholder="Type your question…"
        />
        <button onClick={askQuestion} disabled={loading}>
          Ask
        </button>
      </div>
    </div>
  );
}

export default App;