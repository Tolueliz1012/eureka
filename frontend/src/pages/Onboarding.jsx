import { useState, useRef } from "react";
import { generateCurriculum } from "../api";

const SUBJECTS = [
  { label: "Math",    icon: "∑", color: "#7C3AED" },
  { label: "Python",  icon: "⌨", color: "#0EA5E9" },
  { label: "Spanish", icon: "¡", color: "#F59E0B" },
  { label: "Science", icon: "⚗", color: "#10B981" },
  { label: "History", icon: "⏳", color: "#EF4444" },
  { label: "English", icon: "✦", color: "#EC4899" },
  { label: "Other",   icon: "+", color: "#6B7280" },
];

const LEVELS = [
  { value: "beginner",     label: "Beginner",     desc: "Starting from scratch" },
  { value: "intermediate", label: "Intermediate", desc: "I know the basics" },
  { value: "advanced",     label: "Advanced",     desc: "I want to go deep" },
];

const css = `
  .ob-root{background:#0F0F13;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:20px}
  .ob-card{background:#18181F;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:48px 44px;width:100%;max-width:520px}
  .ob-logo{font-size:20px;color:#F5F3EE;margin-bottom:32px;font-family:Georgia,serif}
  .ob-logo span{color:#A78BFA}
  .ob-title{font-size:26px;font-weight:700;color:#F5F3EE;margin-bottom:6px}
  .ob-sub{font-size:14px;color:#6B6875;margin-bottom:32px}
  .ob-label{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6B6875;font-weight:600;margin-bottom:12px;display:block}
  .subject-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:28px}
  .sBtn{background:#13111C;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px 8px;cursor:pointer;text-align:center;width:100%;transition:all 0.15s}
  .sBtn:hover{border-color:rgba(255,255,255,0.2)}
  .sIcon{font-size:18px;font-weight:700;margin-bottom:6px}
  .sName{font-size:11px;color:#9CA3AF;font-weight:500}
  .ob-input{width:100%;background:#13111C;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 16px;color:#F5F3EE;font-size:15px;font-family:system-ui,sans-serif;outline:none;box-sizing:border-box;margin-bottom:28px}
  .ob-input::placeholder{color:#4B4A52}
  .ob-input:focus{border-color:rgba(124,58,237,0.5)}
  .level-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:32px}
  .lBtn{background:#13111C;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px 12px;cursor:pointer;text-align:center;width:100%}
  .lBtn.active{border:2px solid #7C3AED;background:rgba(124,58,237,0.1)}
  .lName{font-size:13px;font-weight:600;color:#F5F3EE;margin-bottom:4px}
  .lDesc{font-size:11px;color:#6B6875}
  .ob-btn{width:100%;padding:15px;background:#7C3AED;color:#fff;border:none;border-radius:12px;font-size:15px;font-family:system-ui,sans-serif;font-weight:600;cursor:pointer}
  .ob-btn:disabled{opacity:0.4;cursor:default}
`;

export default function Onboarding({ userId, onComplete }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customSubject, setCustomSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);

  const finalSubject = showOtherInput ? customSubject.trim() : selectedSubject;
  const canSubmit = finalSubject && goal.trim() && level;

  const handleSubjectClick = (label) => {
    if (label === "Other") {
      setShowOtherInput(true);
      setSelectedSubject("Other");
    } else {
      setShowOtherInput(false);
      setSelectedSubject(label);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await generateCurriculum({ user_id: userId, subject: finalSubject, goal, level });
    setLoading(false);
    onComplete(finalSubject);
  };

  return (
    <div className="ob-root">
      <style>{css}</style>
      <div className="ob-card">
        <div className="ob-logo">Eure<span>ka</span></div>
        <div className="ob-title">Build your curriculum</div>
        <div className="ob-sub">Personalized just for you — takes 30 seconds.</div>

        <span className="ob-label">What do you want to learn?</span>
        <div className="subject-grid">
          {SUBJECTS.map(s => {
            const isActive = selectedSubject === s.label;
            return (
              <button key={s.label} className="sBtn"
                style={isActive ? { borderColor: s.color, borderWidth: 2, background: s.color + "18" } : {}}
                onClick={() => handleSubjectClick(s.label)}>
                <div className="sIcon" style={{ color: s.color }}>{s.icon}</div>
                <div className="sName">{s.label}</div>
              </button>
            );
          })}
        </div>

        {showOtherInput && (
          <div>
            <span className="ob-label">Name your subject</span>
            <input
              className="ob-input"
              placeholder="e.g. Guitar, French, Chemistry..."
              value={customSubject}
              onChange={e => setCustomSubject(e.target.value)}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        <span className="ob-label">What is your goal?</span>
        <input className="ob-input"
          placeholder="e.g. Pass my algebra exam, build a website..."
          value={goal}
          onChange={e => setGoal(e.target.value)}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        />

        <span className="ob-label">Your current level</span>
        <div className="level-grid">
          {LEVELS.map(l => (
            <button key={l.value}
              className={"lBtn" + (level === l.value ? " active" : "")}
              onClick={() => setLevel(l.value)}>
              <div className="lName">{l.label}</div>
              <div className="lDesc">{l.desc}</div>
            </button>
          ))}
        </div>

        <button className="ob-btn" onClick={handleSubmit} disabled={loading || !canSubmit}>
          {loading ? "Building your curriculum..." : "Start Learning →"}
        </button>
      </div>
    </div>
  );
}
