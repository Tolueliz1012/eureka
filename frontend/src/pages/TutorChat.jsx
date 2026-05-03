import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessage, getCurriculum, advanceTopic } from "../api";


const QUIZ_PROMPT = (topic) => `Generate a 3-question quiz about "${topic}". Format EXACTLY like this:\n\nQUIZ_START\nQ1: [question]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nANSWER: [A, B, C, or D]\n\nQ2: [question]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nANSWER: [A, B, C, or D]\n\nQ3: [question]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nANSWER: [A, B, C, or D]\nQUIZ_END`;

function parseQuiz(text) {
  if (!text.includes("QUIZ_START")) return null;
  const block = text.split("QUIZ_START")[1].split("QUIZ_END")[0];
  const qBlocks = block.trim().split(/Q[1-9]:/).filter(Boolean);
  return qBlocks.map(qb => {
    const lines = qb.trim().split("\n").map(l => l.trim()).filter(Boolean);
    const question = lines[0];
    const options = lines.filter(l => /^[A-D]\)/.test(l));
    const answerLine = lines.find(l => l.startsWith("ANSWER:"));
    const answer = answerLine ? answerLine.replace("ANSWER:", "").trim() : "A";
    return { question, options, answer };
  }).filter(q => q.question && q.options.length > 0);
}

function QuizCard({ quiz, topic, onDone }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = submitted ? quiz.filter((q, i) => answers[i] === q.answer).length : 0;
  return (
    <div style={{ background: "#1E1B2E", border: "1px solid #4f46e5", borderRadius: 20, padding: 28, margin: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#2D2A45", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧠</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#F5F3EE", fontFamily: "system-ui,sans-serif" }}>Quiz: {topic}</div>
          <div style={{ fontSize: 13, color: "#6B6875", fontFamily: "system-ui,sans-serif" }}>Answer all {quiz.length} questions</div>
        </div>
      </div>
      {quiz.map((q, i) => (
        <div key={i} style={{ marginBottom: 20, background: "#13111C", borderRadius: 14, padding: 18, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontWeight: 600, marginBottom: 12, color: "#F5F3EE", fontSize: 14, fontFamily: "system-ui,sans-serif" }}>{i+1}. {q.question}</div>
          {q.options.map((opt, j) => {
            const letter = opt[0];
            const isSelected = answers[i] === letter;
            const isCorrect = submitted && letter === q.answer;
            const isWrong = submitted && isSelected && letter !== q.answer;
            return (
              <button key={j} onClick={() => !submitted && setAnswers({...answers, [i]: letter})}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", marginBottom: 8, borderRadius: 10,
                  cursor: submitted ? "default" : "pointer", fontFamily: "system-ui,sans-serif", fontSize: 14,
                  color: isCorrect ? "#10b981" : isWrong ? "#ef4444" : isSelected ? "#A78BFA" : "#9CA3AF",
                  border: isCorrect ? "1px solid #10b981" : isWrong ? "1px solid #ef4444" : isSelected ? "1px solid #7C3AED" : "1px solid rgba(255,255,255,0.08)",
                  background: isCorrect ? "rgba(16,185,129,0.1)" : isWrong ? "rgba(239,68,68,0.1)" : isSelected ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)" }}>
                {opt}
              </button>
            );
          })}
        </div>
      ))}
      {!submitted ? (
        <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < quiz.length}
          style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontFamily: "system-ui,sans-serif", fontWeight: 600, cursor: "pointer", opacity: Object.keys(answers).length < quiz.length ? 0.5 : 1 }}>
          Submit Answers
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: score === 3 ? "#10b981" : score >= 2 ? "#f59e0b" : "#ef4444", fontFamily: "system-ui,sans-serif" }}>
            {score === 3 ? "🎉 Perfect!" : score >= 2 ? "👍 Good job!" : "📖 Keep going!"} {score}/{quiz.length}
          </div>
          <button onClick={() => onDone(score)}
            style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontFamily: "system-ui,sans-serif", fontWeight: 600, cursor: "pointer" }}>
            {score >= 2 ? "Next Topic →" : "Review Again"}
          </button>
        </div>
      )}
    </div>
  );
}

const css = `
  .chat-root{background:#0F0F13;min-height:100vh;display:flex;flex-direction:column;font-family:system-ui,sans-serif}
  .chat-header{background:#18181F;border-bottom:1px solid rgba(255,255,255,0.06);padding:16px 28px;flex-shrink:0}
  .progress-track{background:rgba(255,255,255,0.07);border-radius:100px;height:4px;margin-top:8px}
  .progress-fill{height:4px;border-radius:100px;background:#7C3AED;transition:width 0.6s ease}
  .chat-body{flex:1;overflow-y:auto;padding:28px;display:flex;flex-direction:column;gap:16px}
  .chat-body::-webkit-scrollbar{width:4px}
  .chat-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:10px}
  .msg-row-ai{display:flex;align-items:flex-start;gap:12px}
  .msg-row-user{display:flex;justify-content:flex-end}
  .ai-avatar{width:34px;height:34px;border-radius:10px;background:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
  .bubble-ai{background:#18181F;border:1px solid rgba(255,255,255,0.07);border-radius:4px 18px 18px 18px;padding:14px 18px;max-width:78%;color:#E5E3DF;font-size:15px;line-height:1.7}
  .bubble-user{background:#7C3AED;border-radius:18px 4px 18px 18px;padding:12px 18px;max-width:72%;color:#fff;font-size:15px;line-height:1.6}
  .dot{width:7px;height:7px;border-radius:50%;background:#6B6875;animation:bounce 1.2s infinite;display:inline-block;margin:0 2px}
  .dot:nth-child(2){animation-delay:0.2s}.dot:nth-child(3){animation-delay:0.4s}
  @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
  .chat-footer{background:#18181F;border-top:1px solid rgba(255,255,255,0.06);padding:16px 28px;display:flex;gap:12px;flex-shrink:0}
  .chat-input{flex:1;background:#0F0F13;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:13px 18px;color:#F5F3EE;font-size:15px;font-family:system-ui,sans-serif;outline:none}
  .chat-input::placeholder{color:#4B4A52}
  .chat-input:focus{border-color:rgba(124,58,237,0.5)}
  .send-btn{background:#7C3AED;color:#fff;border:none;border-radius:12px;padding:13px 24px;font-size:15px;font-family:system-ui,sans-serif;font-weight:600;cursor:pointer}
  .send-btn:disabled{opacity:0.4;cursor:default}
  .quiz-btn{background:rgba(124,58,237,0.15);color:#A78BFA;border:1px solid rgba(124,58,237,0.4);border-radius:12px;padding:12px 20px;font-size:14px;font-family:system-ui,sans-serif;font-weight:600;cursor:pointer;margin:4px auto;display:block}
  .topic-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(167,139,250,0.1);color:#A78BFA;border-radius:8px;padding:4px 10px;font-size:12px;font-weight:500;margin-bottom:6px}
  .md-dark p{margin:0 0 8px;color:#E5E3DF}.md-dark p:last-child{margin:0}
  .md-dark h1,.md-dark h2,.md-dark h3{font-weight:700;margin:12px 0 6px;color:#F5F3EE}
  .md-dark ul,.md-dark ol{padding-left:20px;margin:6px 0}
  .md-dark li{margin-bottom:4px;color:#E5E3DF}
  .md-dark strong{font-weight:700;color:#F5F3EE}
  .md-dark code{background:rgba(255,255,255,0.08);padding:2px 7px;border-radius:5px;font-family:monospace;font-size:13px;color:#C4B5FD}
  .md-dark pre{background:#0A0A0F;border:1px solid rgba(255,255,255,0.08);padding:14px;border-radius:10px;overflow-x:auto;margin:10px 0}
  .md-dark pre code{background:none;color:#cdd6f4;padding:0}
  .md-dark blockquote{border-left:3px solid #7C3AED;padding-left:12px;color:#9CA3AF;margin:10px 0}
  .md-dark hr{border:none;border-top:1px solid rgba(255,255,255,0.08);margin:12px 0}
`;

export default function TutorChat({ subject, userId, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [showQuizBtn, setShowQuizBtn] = useState(false);
  const bottomRef = useRef(null);
  const msgCount = useRef(0);

  useEffect(() => {
    getCurriculum(userId, subject).then(res => setCurriculum(res.data)).catch(() => {});
  }, [subject]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, quizData]);

  const currentTopic = curriculum?.topics?.[curriculum.current_topic_index] || "Introduction";
  const progress = curriculum ? (curriculum.current_topic_index / curriculum.topics.length) * 100 : 0;

  const send = async (overrideMsg) => {
    const text = overrideMsg !== undefined ? overrideMsg : input;
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowQuizBtn(false);
    msgCount.current += 1;
    try {
      const res = await sendMessage({ user_id: userId, user_name: "Elizabeth", subject, current_topic: currentTopic, messages: newMessages });
      const reply = res.data.reply;
      const quiz = parseQuiz(reply);
      if (quiz && quiz.length > 0) {
        setQuizData({ quiz, topic: currentTopic });
        const preText = reply.split("QUIZ_START")[0].trim();
        if (preText) setMessages([...newMessages, { role: "assistant", content: preText }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: reply }]);
        if (msgCount.current % 4 === 0) setShowQuizBtn(true);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Try again!" }]);
    }
    setLoading(false);
  };

  const startQuiz = async () => {
    setLoading(true); setShowQuizBtn(false);
    try {
      const res = await sendMessage({ user_id: userId, user_name: "Elizabeth", subject, current_topic: currentTopic, messages: [{ role: "user", content: QUIZ_PROMPT(currentTopic) }] });
      const quiz = parseQuiz(res.data.reply);
      if (quiz && quiz.length > 0) setQuizData({ quiz, topic: currentTopic });
    } catch {}
    setLoading(false);
  };

  const handleQuizDone = async (score) => {
    setQuizData(null);
    if (score >= 2 && curriculum) {
      await advanceTopic(curriculum.id);
      const updated = await getCurriculum(userId, subject);
      setCurriculum(updated.data);
      const nextTopic = updated.data.topics[updated.data.current_topic_index];
      setMessages(prev => [...prev, { role: "assistant", content: nextTopic ? `Great work! Moving on to **${nextTopic}**. Ready?` : "You completed all topics! Amazing work!" }]);
    } else {
      setMessages(prev => [...prev, { role: "assistant", content: "No worries! Let us review more. What would you like me to clarify?" }]);
    }
  };

  return (
    <div className="chat-root">
      <style>{css}</style>
      <div className="chat-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#F5F3EE" }}>📚 {subject}</div>
          <span style={{ fontSize: 12, color: "#6B6875" }}>{(curriculum?.current_topic_index || 0) + 1} / {curriculum?.topics?.length || "?"} topics</span>
        </div>
        <div className="topic-badge">📍 {currentTopic}</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: progress + "%" }} />
        </div>
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#4B4A52", margin: "auto", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p>Say hi to Alex to start learning {subject}!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "msg-row-user" : "msg-row-ai"}>
            {m.role === "assistant" && <div className="ai-avatar">A</div>}
            <div className={m.role === "user" ? "bubble-user" : "bubble-ai"}>
              {m.role === "assistant"
                ? <div className="md-dark"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                : m.content}
            </div>
          </div>
        ))}
        {quizData && <QuizCard quiz={quizData.quiz} topic={quizData.topic} onDone={handleQuizDone} />}
        {showQuizBtn && !quizData && (
          <button className="quiz-btn" onClick={startQuiz}>🧠 Take a Quick Quiz</button>
        )}
        {loading && (
          <div className="msg-row-ai">
            <div className="ai-avatar">A</div>
            <div className="bubble-ai">
              <div className="dot"></div><div className="dot"></div><div className="dot"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-footer">
        <input className="chat-input" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask Alex anything..." />
        <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>Send →</button>
      </div>
    </div>
  );
}
  